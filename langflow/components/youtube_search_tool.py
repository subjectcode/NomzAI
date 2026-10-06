import json
import logging
import os
import re

from lfx.custom.custom_component.component import Component
from lfx.io import IntInput, MessageTextInput, Output, SecretStrInput
from lfx.schema.message import Message

logger = logging.getLogger(__name__)


def parse_youtube_duration(duration_str: str) -> str:
    """Parses ISO 8601 duration string (e.g. PT1H2M10S) to HH:MM:SS or MM:SS."""
    match = re.match(r"PT(\d+H)?(\d+M)?(\d+S)?", duration_str)
    if not match:
        return ""
    h, m, s = match.groups()
    h = int(h[:-1]) if h else 0
    m = int(m[:-1]) if m else 0
    s = int(s[:-1]) if s else 0
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


class YouTubeSearchTool(Component):
    display_name = "YouTube Search Tool"
    description = (
        "Mengeksekusi pencarian video kuliner terkurasi langsung ke YouTube Data API v3, "
        "mengambil metadata durasi teknis nyata (ISO 8601), thumbnail, dan channel."
    )
    icon = "video"
    name = "YouTubeSearchTool"

    inputs = [
        MessageTextInput(
            name="intent",
            display_name="Search Intent",
            info="Pesan intent pencarian dari VideoSearchIntent.",
        ),
        SecretStrInput(
            name="api_key",
            display_name="YouTube API Key",
            info="Kunci API YouTube Data v3 (dari kredensial Langflow).",
            value="YOUTUBE_API_KEY",
        ),
        IntInput(
            name="max_results",
            display_name="Max Results",
            info="Jumlah kandidat video yang dicari (default 15).",
            value=15,
        ),
    ]

    outputs = [
        Output(display_name="Candidate Videos", name="candidates", method="search_youtube"),
    ]

    def search_youtube(self) -> Message:
        intent_raw = getattr(self.intent, "text", None) or str(self.intent or "{}")
        try:
            intent_data = json.loads(intent_raw)
        except Exception:
            intent_data = {}

        query = intent_data.get("search_query") or "resep masakan nusantara"
        max_res = int(self.max_results or 15)

        # Ambil api_key dari konfigurasi node atau environment
        yt_key = self.api_key or os.environ.get("YOUTUBE_API_KEY", "")
        if hasattr(yt_key, "get_secret_value"):
            yt_key = yt_key.get_secret_value()
        yt_key = str(yt_key or "").strip()

        videos = []
        if yt_key:
            try:
                from googleapiclient.discovery import build

                youtube = build("youtube", "v3", developerKey=yt_key)
                search_resp = youtube.search().list(
                    q=query,
                    part="id,snippet",
                    type="video",
                    maxResults=min(max_res, 50),
                ).execute()

                candidate_ids = []
                for item in search_resp.get("items", []):
                    vid = item.get("id", {}).get("videoId")
                    if vid and vid not in candidate_ids:
                        candidate_ids.append(vid)

                details_map = {}
                if candidate_ids:
                    v_resp = youtube.videos().list(
                        id=",".join(candidate_ids),
                        part="contentDetails,snippet",
                    ).execute()
                    for item in v_resp.get("items", []):
                        details_map[item["id"]] = item

                for vid in candidate_ids:
                    detail = details_map.get(vid)
                    if not detail:
                        continue
                    snippet = detail.get("snippet", {})
                    content_details = detail.get("contentDetails", {})
                    duration = parse_youtube_duration(content_details.get("duration", ""))
                    thumbnails = snippet.get("thumbnails", {})
                    thumbnail_url = (
                        thumbnails.get("high", {}).get("url")
                        or thumbnails.get("medium", {}).get("url")
                        or thumbnails.get("default", {}).get("url")
                        or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
                    )

                    videos.append({
                        "video_id": vid,
                        "title": snippet.get("title", ""),
                        "channel_title": snippet.get("channelTitle", ""),
                        "thumbnail_url": thumbnail_url,
                        "duration": duration,
                        "url": f"https://www.youtube.com/watch?v={vid}",
                    })
            except Exception as e:
                logger.warning("Eksekusi YouTubeSearchTool error: %s", e)

        result_payload = {
            "query": query,
            "candidates": videos,
            "intent": intent_data,
        }
        self.status = f"Found {len(videos)} videos for '{query[:30]}...'"
        return Message(text=json.dumps(result_payload, ensure_ascii=False, indent=2))
