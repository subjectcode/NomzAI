import json
import logging
from typing import List
from fastapi import HTTPException, status
from google import genai
from google.genai import types
from google.genai.errors import APIError
from app.core.config import settings
from app.schemas.recommendation import (
    RecommendationResponse,
    RecipeRecommendationItem,
)
from app.services.langflow import run_find_meals_flow

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Anda adalah koki profesional dan perencana kuliner harian. Berdasarkan daftar bahan makanan yang dimiliki pengguna, rekomendasikan 3 hingga 5 ide masakan rumahan yang praktis, lezat, dan realistis dibuat di dapur rumah.

Aturan Ketat:
1. Prioritaskan hidangan yang memaksimalkan penggunaan bahan dari daftar pengguna.
2. Kolom 'bahan_tersedia' HANYA BOLEH berisi bahan yang benar-benar ada di daftar input pengguna. DILARANG KERAS mencantumkan bahan sebagai 'tersedia' jika tidak ada dalam input pengguna.
3. Kolom 'bahan_tambahan' berisi bumbu dasar atau bahan pelengkap umum yang lazim tersedia di dapur (misal: minyak goreng, garam, lada, bawang merah, kecap, saus tiram).
4. Estimasi waktu memasak harus realistis (contoh: "15 menit", "25 menit", "35 menit").
5. Tingkat kesulitan masakan berupa salah satu dari: "Mudah", "Sedang", atau "Sulit".
6. Jelaskan alasan singkat dan menggugah selera mengapa hidangan ini cocok dibuat dengan kombinasi bahan tersebut.
7. JANGAN membuat klaim keamanan pangan absolut (misal: jangan membuat klaim '100% aman untuk penderita alergi tertentu').
8. Seluruh teks wajib dalam Bahasa Indonesia baku yang hangat, jelas, dan ramah pengguna.
"""


def _generate_recommendations_gemini_fallback(cleaned_ingredients: List[str]) -> RecommendationResponse:
    """Fallback generator langsung via Gemini SDK jika server Langflow tidak aktif."""
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Kunci API AI belum dikonfigurasi. Silakan set GEMINI_API_KEY di backend/.env",
        )

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    user_prompt = (
        f"Daftar bahan makanan yang saya miliki:\n"
        f"{', '.join(cleaned_ingredients)}\n\n"
        f"Berikan rekomendasi masakan terbaik yang dapat dibuat dengan memaksimalkan bahan-bahan di atas."
    )

    candidate_models: List[str] = [settings.VISION_MODEL]
    for fallback in ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error = None
    for model_name in candidate_models:
        try:
            logger.info("Meminta rekomendasi masakan fallback Gemini: %s", model_name)
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    SYSTEM_PROMPT,
                    user_prompt,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RecommendationResponse,
                    temperature=0.3,
                ),
            )

            raw_text = response.text
            if not raw_text:
                raise ValueError("Menerima respons kosong dari model rekomendasi")

            data = json.loads(raw_text)
            parsed_response = RecommendationResponse.model_validate(data)
            parsed_response.source = f"gemini-fallback-{model_name}"

            for item in parsed_response.recommendations:
                sanitized_tersedia = []
                for b in item.bahan_tersedia:
                    b_lower = b.lower()
                    if any(user_ing in b_lower or b_lower in user_ing for user_ing in cleaned_ingredients):
                        sanitized_tersedia.append(b)
                    else:
                        if b not in item.bahan_tambahan:
                            item.bahan_tambahan.append(b)
                item.bahan_tersedia = sanitized_tersedia if sanitized_tersedia else [cleaned_ingredients[0]]

            return parsed_response

        except APIError as api_err:
            last_error = api_err
            error_message = str(api_err)
            logger.warning("APIError fallback Gemini %s: %s", model_name, error_message)
            if "503" in error_message or "404" in error_message:
                continue
            if "401" in error_message or "403" in error_message:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Autentikasi penyedia AI gagal: {error_message}",
                )
        except Exception as exc:
            last_error = exc
            logger.warning("Error pada fallback Gemini %s: %s", model_name, str(exc))
            continue

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"Gagal menghasilkan rekomendasi masakan fallback: {str(last_error)}",
    )


def generate_recommendations(ingredients: List[str]) -> RecommendationResponse:
    """Menghasilkan rekomendasi masakan terstruktur.

    Jalur utama: Langflow Workflow (find_meals).
    Jalur cadangan: Gemini direct fallback jika Langflow tidak dapat dihubungi.
    """
    cleaned_ingredients = [ing.strip().lower() for ing in ingredients if ing and ing.strip()]
    if not cleaned_ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Daftar bahan makanan tidak boleh kosong.",
        )

    # 1. Jalur Utama M3: Langflow find_meals workflow
    if settings.LANGFLOW_BASE_URL and settings.LANGFLOW_FLOW_ID:
        try:
            logger.info(
                "M3: Menjalankan Langflow Workflow find_meals (Base URL: %s, Flow ID: %s)",
                settings.LANGFLOW_BASE_URL,
                settings.LANGFLOW_FLOW_ID,
            )
            response = run_find_meals_flow(cleaned_ingredients)
            response.source = "langflow"
            response.flow_id = settings.LANGFLOW_FLOW_ID
            logger.info("M3: Berhasil mendapatkan respon terverifikasi dari Langflow")
            return response
        except HTTPException as http_exc:
            # Jika 400 bad request, jangan fallback ke Gemini
            if http_exc.status_code == status.HTTP_400_BAD_REQUEST:
                raise
            # Jika Langflow 503/504 (down/unreachable), catat dan gunakan fallback
            logger.warning("Langflow gagal (status %s: %s). Mencoba jalur cadangan...", http_exc.status_code, http_exc.detail)
        except Exception as err:
            logger.warning("Kesalahan tidak terduga pada Langflow: %s. Mencoba jalur cadangan...", err)

    # 2. Jalur Cadangan (Safe Fallback)
    return _generate_recommendations_gemini_fallback(cleaned_ingredients)
