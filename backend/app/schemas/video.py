from typing import List, Optional
from pydantic import BaseModel

class VideoRecommendation(BaseModel):
    video_id: str
    title: str
    channel_title: str
    thumbnail_url: str
    duration: Optional[str] = None
    url: str

class VideoSearchResponse(BaseModel):
    videos: List[VideoRecommendation]
    source: str
    total: Optional[int] = None
    offset: Optional[int] = 0
    limit: Optional[int] = 50
