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

SYSTEM_PROMPT = """Anda adalah koki profesional dan perencana kuliner harian. Berdasarkan daftar bahan makanan yang dimiliki pengguna (beserta takarannya), rekomendasikan 3 hingga 5 ide masakan rumahan yang praktis, lezat, dan realistis dibuat di dapur rumah.

Aturan Ketat:
1. Prioritaskan hidangan yang memaksimalkan penggunaan bahan dari daftar pengguna.
2. Kolom 'bahan_tersedia' HANYA BOLEH berisi bahan yang benar-benar ada di daftar input pengguna, beserta takarannya jika ada (misal: "2 butir telur", "150 g ayam fillet"). DILARANG KERAS mencantumkan bahan sebagai 'tersedia' jika tidak ada dalam input pengguna.
3. Kolom 'bahan_tambahan' berisi bumbu dasar atau bahan pelengkap umum dengan takaran wajar dapur (misal: "1 sdm minyak goreng", "2 siung bawang putih cincang", "1/2 sdt garam", "1/4 sdt merica").
4. Kolom 'metode_masak' wajib diisi metode memasak utama masakan (misal: "Tumis", "Panggang", "Kukus", "Rebus", "Goreng", "Air Fryer").
5. GAYA MASAK (COOKING STYLE): Jika pengguna menentukan gaya masak (misal: "Tumis", "Panggang", "Kukus", "Rebus", "Goreng", "Air Fryer"), MAKA SETIAP REKOMENDASI HIDANGAN WAJIB MENJADIKAN METODE TERSEBUT SEBAGAI METODE MEMASAK UTAMA. Jangan merekomendasikan masakan dengan metode bertolak belakang (misal: jika diminta "Kukus", dilarang menghasilkan masakan yang digoreng atau ditumis kering; jika diminta "Panggang", dilarang menghasilkan sup rebusan).
6. PANDUAN MEMASAK TEKNIS (GUIDED COOKING STEPS):
   Langkah-langkah dalam 'langkah' TIDAK BOLEH hanya tindakan generik dangkal (seperti 'cuci bahan', 'panaskan wajan', 'masak ayam').
   Langkah memasak harus berupa panduan asisten koki yang teknis, terukur, dan berurutan:
   - Sebutkan bahan dan jumlah spesifik yang dimasukkan pada langkah tersebut.
   - Cantumkan tingkat panas api ('api sedang', 'api kecil', 'api sedang-tinggi').
   - Jelaskan kondisi wajan/alat ('wajan panas', 'minyak mulai berdesis tipis', 'air mendidih bergolak').
   - Cantumkan estimasi waktu/durasi terukur ('2-3 menit', '±45 detik', '10-12 menit').
   - Cantumkan teknik pengolahan ('aduk cepat', 'jangan sering dibolak-balik sampai sisi bawah kecokelatan', 'lipat perlahan').
   - Cantumkan indikator visual & aroma kematangan ('sampai permukaan kecokelatan keemasan', 'aroma harum bawang semerbak', 'saus mengental dan menyelimuti bahan').
   - Cantumkan peringatan teknis atau tips kritis ('turunkan api agar bumbu tidak gosong', 'jangan tutup wajan agar tekstur tetap renyah').
   - Alur langkah terbagi logis: Persiapan bahan -> Pengolahan utama -> Pembumbuan & koreksi rasa -> Penyelesaian & Penyajian.
7. Estimasi waktu memasak harus realistis (contoh: "15 menit", "25 menit", "35 menit").
8. Tingkat kesulitan masakan berupa salah satu dari: "Mudah", "Sedang", atau "Sulit".
9. Jelaskan alasan singkat dan menggugah selera mengapa hidangan ini cocok dibuat dengan kombinasi bahan dan gaya masak tersebut.
10. JANGAN membuat klaim keamanan pangan absolut.
11. Seluruh teks wajib dalam Bahasa Indonesia baku yang hangat, jelas, dan ramah pengguna.
"""


def _generate_recommendations_gemini_fallback(
    cleaned_ingredients: List[str],
    cooking_style: str | None = None,
    constraint: str | None = None,
) -> RecommendationResponse:
    """Fallback generator langsung via Gemini SDK jika server Langflow tidak aktif."""
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Kunci API AI belum dikonfigurasi. Silakan set GEMINI_API_KEY di backend/.env",
        )

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt_lines = [
        f"Daftar bahan makanan yang saya miliki:\n{', '.join(cleaned_ingredients)}",
    ]
    if cooking_style:
        prompt_lines.append(
            f"GAYA MASAK WAJIB: {cooking_style}. Semua rekomendasi hidangan WAJIB dimasak dengan metode utama {cooking_style}."
        )
    if constraint:
        prompt_lines.append(f"Kendala khusus: {constraint}.")
    prompt_lines.append(
        "Berikan 3-5 rekomendasi masakan terbaik yang memaksimalkan bahan di atas dengan langkah memasak teknis dan terukur."
    )
    user_prompt = "\n\n".join(prompt_lines)

    candidate_models: List[str] = [settings.VISION_MODEL]
    for fallback in ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    last_error = None
    for model_name in candidate_models:
        try:
            logger.info("Meminta rekomendasi masakan fallback Gemini: %s (gaya: %s)", model_name, cooking_style)
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
                # 1. Sanitasi bahan_tersedia
                sanitized_tersedia = []
                for b in item.bahan_tersedia:
                    b_lower = b.lower()
                    if any(user_ing in b_lower or b_lower in user_ing for user_ing in cleaned_ingredients):
                        sanitized_tersedia.append(b)
                    else:
                        if b not in item.bahan_tambahan:
                            item.bahan_tambahan.append(b)
                item.bahan_tersedia = sanitized_tersedia if sanitized_tersedia else [cleaned_ingredients[0]]

                # 2. Validasi & penyesuaian gaya masak
                if cooking_style:
                    item.metode_masak = cooking_style
                elif not item.metode_masak:
                    item.metode_masak = "Tumis"

                # 3. Pastikan langkah memasak ada dan informatif
                if not item.langkah:
                    item.langkah = [
                        f"Persiapan: Siapkan dan potong bahan utama ({', '.join(item.bahan_tersedia)}) sesuai selera.",
                        f"Pengolahan: Panaskan wajan/panci dengan api sedang selama 2 menit. Masukkan bahan utama dan olah dengan teknik {item.metode_masak.lower()} selama 3-4 menit hingga berubah warna dan matang merata.",
                        "Pembumbuan: Tambahkan bumbu pelengkap dan sedikit air jika perlu, aduk rata selama 1-2 menit hingga meresap dan aroma harum keluar.",
                        "Penyajian: Matikan api, angkat hidangan, dan sajikan hangat di atas piring saji.",
                    ]

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


def generate_recommendations(
    ingredients: List[str],
    mode: str = "rescue",
    constraint: str | None = None,
    cooking_style: str | None = None,
) -> RecommendationResponse:
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

    # 1. Jalur Utama: Langflow find_meals workflow
    if settings.LANGFLOW_BASE_URL and settings.LANGFLOW_FLOW_ID:
        try:
            logger.info(
                "Menjalankan Langflow Workflow find_meals (Base URL: %s, Flow ID: %s, Mode: %s, Constraint: %s, Style: %s)",
                settings.LANGFLOW_BASE_URL,
                settings.LANGFLOW_FLOW_ID,
                mode,
                constraint,
                cooking_style,
            )
            response = run_find_meals_flow(
                cleaned_ingredients,
                mode=mode,
                constraint=constraint,
                cooking_style=cooking_style,
            )
            response.source = "langflow"
            response.flow_id = settings.LANGFLOW_FLOW_ID
            logger.info("Berhasil mendapatkan respon terverifikasi dari Langflow")
            return response
        except HTTPException as http_exc:
            if http_exc.status_code == status.HTTP_400_BAD_REQUEST:
                raise
            logger.warning("Langflow gagal (status %s: %s). Mencoba jalur cadangan...", http_exc.status_code, http_exc.detail)
        except Exception as err:
            logger.warning("Kesalahan tidak terduga pada Langflow: %s. Mencoba jalur cadangan...", err)

    # 2. Jalur Cadangan (Safe Fallback)
    return _generate_recommendations_gemini_fallback(
        cleaned_ingredients,
        cooking_style=cooking_style,
        constraint=constraint,
    )
