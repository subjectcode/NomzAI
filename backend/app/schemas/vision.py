from typing import List
from pydantic import BaseModel, Field


class IngredientItem(BaseModel):
    name: str = Field(
        ...,
        description=(
            "Nama bahan makanan yang terlihat dalam Bahasa Indonesia huruf kecil "
            "(contoh: telur, tomat, daun basil, bawang putih, pisang)"
        ),
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Skor kepastian visual antara 0.0 hingga 1.0",
    )


class IngredientDetectionResponse(BaseModel):
    ingredients: List[IngredientItem]
