import json
import logging
import re
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session
from googleapiclient.discovery import build

from app.core.config import settings
from app.db.models import VideoSearchCache
from app.schemas.video import VideoRecommendation, VideoSearchResponse

logger = logging.getLogger(__name__)

def parse_youtube_duration(duration_str: str) -> str:
    """Parses ISO 8601 duration string (e.g. PT1H2M10S) to HH:MM:SS or MM:SS."""
    match = re.match(r'PT(\d+H)?(\d+M)?(\d+S)?', duration_str)
    if not match:
        return ""
    h, m, s = match.groups()
    h = int(h[:-1]) if h else 0
    m = int(m[:-1]) if m else 0
    s = int(s[:-1]) if s else 0
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"

def _search_composio(query: str, max_results: int = 35) -> Optional[List[VideoRecommendation]]:
    try:
        from composio import ComposioToolSet, Action
        if not settings.COMPOSIO_API_KEY:
            raise ValueError("No COMPOSIO_API_KEY configured")
        
        toolset = ComposioToolSet(api_key=settings.COMPOSIO_API_KEY)
        result = toolset.execute_action(
            action=Action.YOUTUBE_YOUTUBE_SEARCH,
            params={"search_query": query, "max_results": max_results}
        )
        
        videos = []
        if isinstance(result, dict) and "data" in result:
            items = result["data"].get("items", [])
            seen_ids = set()
            for item in items:
                video_id = item.get("id", {}).get("videoId") or item.get("id")
                if not video_id or video_id in seen_ids:
                    continue
                seen_ids.add(video_id)
                snippet = item.get("snippet", {})
                videos.append(VideoRecommendation(
                    video_id=video_id,
                    title=snippet.get("title", ""),
                    channel_title=snippet.get("channelTitle", ""),
                    thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url", "")
                        or snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
                    duration=None,
                    url=f"https://www.youtube.com/watch?v={video_id}"
                ))
        
        if not videos:
            raise ValueError("Composio returned empty or unparseable videos")
            
        return videos
    except Exception as e:
        err_msg = str(e)
        if "410" in err_msg:
            logger.warning(
                "Composio API backend endpoint returned HTTP 410 (client_info deprecated in current SDK version). "
                "Failing over cleanly to YouTube Data API v3 primary fallback."
            )
        else:
            logger.warning("Composio YouTube search failed, will use fallback: %s", e)
        return None

def _search_youtube_api(query: str, max_results: int = 35) -> List[VideoRecommendation]:
    if not settings.YOUTUBE_API_KEY:
        raise ValueError("No YOUTUBE_API_KEY configured")

    youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)

    # 1. Search for videos using pagination if needed
    seen_ids = set()
    unique_video_ids = []
    page_token = None

    while len(unique_video_ids) < max_results:
        fetch_limit = min(50, max_results - len(unique_video_ids))
        search_req = youtube.search().list(
            q=query,
            part='id,snippet',
            type='video',
            maxResults=fetch_limit,
            pageToken=page_token
        )
        search_response = search_req.execute()
        items = search_response.get('items', [])
        if not items:
            break

        for item in items:
            vid = item.get('id', {}).get('videoId')
            if vid and vid not in seen_ids:
                seen_ids.add(vid)
                unique_video_ids.append(vid)
                if len(unique_video_ids) >= max_results:
                    break

        page_token = search_response.get('nextPageToken')
        if not page_token:
            break

    if not unique_video_ids:
        return []

    # 2. Get video details in batches of up to 50
    details_map = {}
    for i in range(0, len(unique_video_ids), 50):
        batch_ids = unique_video_ids[i:i + 50]
        videos_response = youtube.videos().list(
            id=','.join(batch_ids),
            part='contentDetails,snippet'
        ).execute()
        for item in videos_response.get('items', []):
            details_map[item['id']] = item

    videos = []
    for vid in unique_video_ids:
        detail = details_map.get(vid)
        if not detail:
            continue
        snippet = detail.get('snippet', {})
        content_details = detail.get('contentDetails', {})
        duration = parse_youtube_duration(content_details.get('duration', ''))

        thumbnails = snippet.get('thumbnails', {})
        thumbnail_url = (
            thumbnails.get('high', {}).get('url')
            or thumbnails.get('medium', {}).get('url')
            or thumbnails.get('default', {}).get('url')
            or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
        )

        videos.append(VideoRecommendation(
            video_id=vid,
            title=snippet.get('title', ''),
            channel_title=snippet.get('channelTitle', ''),
            thumbnail_url=thumbnail_url,
            duration=duration,
            url=f"https://www.youtube.com/watch?v={vid}"
        ))

    return videos

def get_video_recommendations(
    db: Session,
    query: str,
    offset: int = 0,
    limit: int = 50
) -> VideoSearchResponse:
    query_key = query.strip().lower()
    
    # 1. Check Cache
    cached = db.query(VideoSearchCache).filter(VideoSearchCache.query == query_key).first()
    cached_videos = None
    if cached:
        # Check freshness (7 days)
        if cached.updated_at > datetime.utcnow() - timedelta(days=7):
            try:
                results_list = json.loads(cached.results)
                # Only reuse if cache has a healthy pool (>= 10 videos)
                if len(results_list) >= 10:
                    cached_videos = [VideoRecommendation(**v) for v in results_list]
            except Exception as e:
                logger.error(f"Error parsing cache for query '{query_key}': {e}")
    
    if cached_videos is not None:
        total = len(cached_videos)
        sliced = cached_videos[offset : offset + limit] if limit else cached_videos[offset:]
        return VideoSearchResponse(
            videos=sliced,
            source="cache",
            total=total,
            offset=offset,
            limit=limit,
        )
    
    # 2. Try Composio Primary
    videos = _search_composio(query, max_results=35)
    source = "composio"
    
    # 3. Try YouTube API Fallback
    if videos is None:
        videos = _search_youtube_api(query, max_results=35)
        source = "youtube_api"
        
    # 4. Cache results (save full pool)
    if videos:
        # Deduplicate
        seen = set()
        deduped = []
        for v in videos:
            if v.video_id not in seen:
                seen.add(v.video_id)
                deduped.append(v)
        videos = deduped
        
        results_json = json.dumps([v.model_dump() for v in videos])
        if cached:
            cached.results = results_json
            cached.updated_at = datetime.utcnow()
        else:
            new_cache = VideoSearchCache(
                query=query_key,
                results=results_json
            )
            db.add(new_cache)
        db.commit()
    
    total = len(videos)
    sliced = videos[offset : offset + limit] if limit else videos[offset:]
    return VideoSearchResponse(
        videos=sliced,
        source=source,
        total=total,
        offset=offset,
        limit=limit,
    )
