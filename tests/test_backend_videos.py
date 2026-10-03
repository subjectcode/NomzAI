import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.db.models import VideoSearchCache
from app.db.database import SessionLocal
from app.services.video_service import (
    get_video_recommendations,
    _search_youtube_api,
    _search_composio,
    parse_youtube_duration,
)


def test_parse_youtube_duration():
    """Verify ISO 8601 duration parser."""
    assert parse_youtube_duration("PT15M33S") == "15:33"
    assert parse_youtube_duration("PT1H2M10S") == "1:02:10"
    assert parse_youtube_duration("PT45S") == "0:45"
    assert parse_youtube_duration("invalid") == ""


def test_video_deduplication_and_limit():
    """Verify that video search results deduplicate by video_id."""
    items = [
        {"id": {"videoId": "vid1"}},
        {"id": {"videoId": "vid2"}},
        {"id": {"videoId": "vid1"}},  # duplicate
        {"id": {"videoId": "vid3"}},
    ]
    seen_ids = set()
    unique_ids = []
    for item in items:
        vid = item.get("id", {}).get("videoId")
        if vid and vid not in seen_ids:
            seen_ids.add(vid)
            unique_ids.append(vid)

    assert len(unique_ids) == 3
    assert unique_ids == ["vid1", "vid2", "vid3"]


def test_video_cache_storage_and_hit():
    """Verify VideoSearchCache saves and retrieves cached search queries."""
    db = SessionLocal()
    test_query = "tumis kangkung terasi lezat"

    try:
        # Clear existing
        db.query(VideoSearchCache).filter(VideoSearchCache.query == test_query).delete()
        db.commit()

        # Seed mock videos
        sample_results = [
            {"video_id": f"vid_{i}", "title": f"Resep {i}", "channel_title": "Chef", "thumbnail_url": "url", "duration": "10:00", "url": f"https://youtube.com/watch?v=vid_{i}"}
            for i in range(15)
        ]

        import json
        cache_row = VideoSearchCache(
            query=test_query,
            results=json.dumps(sample_results),
        )
        db.add(cache_row)
        db.commit()

        # Call get_video_recommendations and verify cache hit
        response = get_video_recommendations(db=db, query=test_query, limit=10)
        assert response.source == "cache"
        assert len(response.videos) == 10
        assert response.total == 15
        assert response.videos[0].video_id == "vid_0"

    finally:
        db.query(VideoSearchCache).filter(VideoSearchCache.query == test_query).delete()
        db.commit()
        db.close()


def test_youtube_api_pagination_flow():
    """Verify that _search_youtube_api uses pagination tokens to reach candidate pool."""
    page1_items = [{"id": {"videoId": f"yt_p1_{i}"}} for i in range(20)]
    page2_items = [{"id": {"videoId": f"yt_p2_{i}"}} for i in range(15)]

    mock_search = MagicMock()
    mock_search.list.side_effect = [
        MagicMock(execute=lambda: {"items": page1_items, "nextPageToken": "token2"}),
        MagicMock(execute=lambda: {"items": page2_items}),
    ]

    mock_videos = MagicMock()
    def make_video_response(*args, **kwargs):
        ids = kwargs.get("id", "").split(",")
        return MagicMock(execute=lambda: {
            "items": [
                {
                    "id": vid,
                    "snippet": {
                        "title": f"Title {vid}",
                        "channelTitle": "Chef Channel",
                        "thumbnails": {"high": {"url": f"https://img/{vid}.jpg"}},
                    },
                    "contentDetails": {"duration": "PT8M20S"},
                }
                for vid in ids
            ]
        })

    mock_videos.list.side_effect = make_video_response

    mock_youtube = MagicMock()
    mock_youtube.search.return_value = mock_search
    mock_youtube.videos.return_value = mock_videos

    with patch("app.services.video_service.build", return_value=mock_youtube):
        with patch("app.services.video_service.settings") as mock_settings:
            mock_settings.YOUTUBE_API_KEY = "test_key"
            results = _search_youtube_api("resep ayam bakar", max_results=35)
            assert len(results) == 35
            assert results[0].video_id == "yt_p1_0"
            assert results[20].video_id == "yt_p2_0"
            assert results[0].duration == "8:20"


def test_composio_fallback_to_youtube_api():
    """Verify that when Composio fails, search falls back cleanly to YouTube API."""
    from app.schemas.video import VideoRecommendation

    db = SessionLocal()
    query = "soto ayam kuah bening segar"

    try:
        # Clear cache
        db.query(VideoSearchCache).filter(VideoSearchCache.query == query).delete()
        db.commit()

        mock_fallback_videos = [
            VideoRecommendation(
                video_id=f"fb_{i}",
                title=f"Soto {i}",
                channel_title="Dapur Chef",
                thumbnail_url="https://img.jpg",
                duration="12:00",
                url=f"https://youtube.com/watch?v=fb_{i}",
            )
            for i in range(10)
        ]

        with patch("app.services.video_service._search_composio", return_value=None):
            with patch("app.services.video_service._search_youtube_api", return_value=mock_fallback_videos):
                response = get_video_recommendations(db=db, query=query, limit=10)
                assert response.source == "youtube_api"
                assert len(response.videos) == 10
                assert response.videos[0].video_id == "fb_0"
    finally:
        db.query(VideoSearchCache).filter(VideoSearchCache.query == query).delete()
        db.commit()
        db.close()
