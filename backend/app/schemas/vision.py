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


class Base64IngredientDetectionRequest(BaseModel):
    image_base64: str = Field(
        ...,
        description="Base64 encoded image string (with or without data:image/... prefix)",
    )
    mime_type: str = Field(
        default="image/jpeg",
        description="MIME type of the image, e.g. image/jpeg, image/png, image/webp",
    )


class IngredientDetectionResponse(BaseModel):
    ingredients: List[IngredientItem]
