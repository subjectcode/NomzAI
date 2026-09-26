from fastapi import APIRouter, HTTPException, Response, status
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation import generate_recommendations

router = APIRouter()


@router.post(
    "",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Mendapatkan rekomendasi masakan berdasarkan bahan yang tersedia",
)
def get_recommendations_endpoint(payload: RecommendationRequest, response: Response):
    """Menerima daftar bahan makanan yang dikonfirmasi pengguna, lalu

    mengembalikan rekomendasi masakan rumahan terstruktur via workflow Langflow.
    """
    cleaned = [item.strip() for item in payload.ingredients if item and item.strip()]
    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Daftar bahan makanan tidak boleh kosong.",
        )

    result = generate_recommendations(cleaned)
    response.headers["X-Recommendation-Engine"] = result.source or "langflow"
    if result.flow_id:
        response.headers["X-Langflow-Flow-Id"] = result.flow_id

    return result
