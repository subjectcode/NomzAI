import io
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from PIL import Image
from app.core.config import settings
from app.schemas.vision import IngredientDetectionResponse
from app.services.vision import detect_ingredients

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


@router.post(
    "/detect-ingredients",
    response_model=IngredientDetectionResponse,
    status_code=status.HTTP_200_OK,
    summary="Detect visible ingredients from uploaded image",
)
async def detect_ingredients_endpoint(
    file: UploadFile = File(..., description="JPG, PNG, or WebP food image file"),
):
    """Uploads an image, validates format and size, and runs multimodal AI

    vision to return structured ingredient list.
    """
    # 1. MIME Type Validation
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid file type '{file.content_type}'. "
                "Only JPG, PNG, and WebP images are supported."
            ),
        )

    # 2. Read bytes
    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}",
        )

    # 3. Non-empty check
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is empty.",
        )

    # 4. Size validation
    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File size ({len(image_bytes) / (1024 * 1024):.1f}MB) "
                f"exceeds the maximum allowed limit of {settings.MAX_IMAGE_SIZE_MB}MB."
            ),
        )

    # 5. Image Integrity Validation via PIL
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img.verify()
            detected_format = img.format.lower() if img.format else ""
            if detected_format not in ["jpeg", "png", "webp"]:
                raise ValueError(f"Unsupported image format: {detected_format}")
    except Exception as img_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The uploaded file is not a valid or readable image: {str(img_err)}",
        )

    # 6. Delegate to Multimodal AI Service
    return detect_ingredients(image_bytes, content_type)
