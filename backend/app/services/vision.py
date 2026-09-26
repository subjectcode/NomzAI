import json
import logging
from typing import List
from fastapi import HTTPException, status
from google import genai
from google.genai import types
from google.genai.errors import APIError
from app.core.config import settings
from app.schemas.vision import IngredientDetectionResponse, IngredientItem

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Anda adalah asisten kuliner profesional. Periksa gambar ini secara cermat dan deteksi HANYA bahan makanan mentah, produk segar, sayuran, buah-buahan, bumbu, rempah, susu/olahan susu, biji-bijian, atau daging yang terlihat langsung.

Aturan Ketat:
1. Hanya sebutkan bahan masakan yang terlihat secara langsung pada gambar.
2. JANGAN mengarang, berasumsi, atau mengklaim bahan yang tidak kasat mata (jangan menebak minyak, garam, penyedap rasa, atau isian tersembunyi jika tidak terlihat).
3. Berikan nama bahan makanan dalam Bahasa Indonesia baku dan umum, menggunakan huruf kecil (contoh: "telur", "tomat", "daun basil", "bawang putih", "pisang", "apel hijau", "stroberi").
4. Berikan nilai confidence (angka desimal antara 0.0 hingga 1.0) yang mencerminkan tingkat kepastian visual.
5. Jika tidak ada bahan makanan yang terlihat, kembalikan daftar kosong.
"""


def detect_ingredients(
    image_bytes: bytes, mime_type: str
) -> IngredientDetectionResponse:
    """Mengirim byte gambar ke model multimodal Gemini dan mengembalikan JSON terstruktur

    berisi daftar bahan dalam Bahasa Indonesia.
    """
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Kunci API multimodal AI belum dikonfigurasi. "
                "Silakan set GEMINI_API_KEY di file backend/.env"
            ),
        )

    # Normalisasi tipe MIME
    normalized_mime = mime_type.lower().split(";")[0].strip()
    if normalized_mime == "image/jpg":
        normalized_mime = "image/jpeg"

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    # Model kandidat untuk dicoba berurutan
    candidate_models: List[str] = [settings.VISION_MODEL]
    for fallback in ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash-lite"]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error = None
    for model_name in candidate_models:
        try:
            logger.info("Mencoba deteksi bahan dengan model: %s", model_name)
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=normalized_mime),
                    SYSTEM_PROMPT,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=IngredientDetectionResponse,
                    temperature=0.1,
                ),
            )

            raw_text = response.text
            if not raw_text:
                raise ValueError("Menerima respons kosong dari model vision")

            data = json.loads(raw_text)
            parsed_response = IngredientDetectionResponse.model_validate(data)
            return parsed_response

        except APIError as api_err:
            last_error = api_err
            error_message = str(api_err)
            # Jika model sedang sibuk (503), tidak ditemukan (404), atau terkena kuota (429), lanjutkan ke kandidat berikutnya
            if "503" in error_message or "404" in error_message or "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:
                continue
            if "401" in error_message or "403" in error_message:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Autentikasi penyedia AI gagal: {error_message}",
                )
        except Exception as exc:
            last_error = exc
            logger.warning("Error pada %s: %s", model_name, str(exc))
            continue

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"Gagal memproses gambar dengan model vision AI: {str(last_error)}",
    )
