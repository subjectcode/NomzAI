from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.video import VideoSearchResponse
from app.services.video_service import get_video_recommendations

router = APIRouter()

@router.get("/search", response_model=VideoSearchResponse)
def search_videos(
    query: str = Query(..., description="Kata kunci pencarian video resep"),
    offset: int = Query(0, ge=0, description="Offset paginasi"),
    limit: int = Query(50, ge=1, le=50, description="Jumlah video per halaman"),
    db: Session = Depends(get_db),
):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty")
        
    try:
        response = get_video_recommendations(db, query, offset=offset, limit=limit)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
