import json
import logging
import re
from typing import List, Optional
import httpx
from fastapi import HTTPException, status
from app.core.config import settings
from app.schemas.recommendation import (
    RecommendationResponse,
    RecipeRecommendationItem,
)

logger = logging.getLogger(__name__)


def _extract_text_from_langflow_response(data: dict) -> str:
    """Mengekstrak teks respons dari struktur output bersarang Langflow v1.x."""
    try:
        outputs = data.get("outputs", [])
        if outputs and isinstance(outputs, list):
            first_output = outputs[0]
            inner_outputs = first_output.get("outputs", [])
            if inner_outputs and isinstance(inner_outputs, list):
                first_inner = inner_outputs[0]
                results = first_inner.get("results", {})
                message = results.get("message", {})

                # Ambil teks langsung atau dari subfield data
                if isinstance(message, dict):
                    text = message.get("text")
                    if text:
                        return str(text)
                    nested_data = message.get("data", {})
                    if isinstance(nested_data, dict) and nested_data.get("text"):
                        return str(nested_data.get("text"))

                # Jika ada field text langsung di results
                if "text" in results:
                    return str(results["text"])
    except Exception as e:
        logger.warning("Gagal ekstraksi cepat dari output Langflow: %s", e)

    # Fallback pencarian rekursif jika format sedikit berbeda
    def _search_text(node):
        if isinstance(node, dict):
            for k in ["text", "content"]:
                if k in node and isinstance(node[k], str) and ("recommendations" in node[k] or "{" in node[k]):
                    return node[k]
            for v in node.values():
                res = _search_text(v)
                if res:
                    return res
        elif isinstance(node, list):
            for item in node:
                res = _search_text(item)
                if res:
                    return res
        return None

    found = _search_text(data)
    if found:
        return found

    raise ValueError(f"Tidak dapat menemukan teks output rekomendasi dalam respons Langflow: {list(data.keys())}")


def _clean_json_markdown(text: str) -> str:
    """Membersihkan markdown code blocks (```json ... ```) dari teks respons."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Hapus baris pembuka ``` atau ```json
        cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
        # Hapus penutup ```
        cleaned = re.sub(r"\n?```$", "", cleaned)
    return cleaned.strip()


def run_find_meals_flow(ingredients: List[str]) -> RecommendationResponse:
    """Mengeksekusi workflow Langflow 'find_meals' secara sinkron via REST API

    menggunakan confirmed ingredients pengguna.
    """
    cleaned_ingredients = [ing.strip().lower() for ing in ingredients if ing and ing.strip()]
    if not cleaned_ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Daftar bahan makanan tidak boleh kosong.",
        )

    base_url = settings.LANGFLOW_BASE_URL.rstrip("/")
    flow_id = settings.LANGFLOW_FLOW_ID
    run_url = f"{base_url}/api/v1/run/{flow_id}"

    headers = {
        "Content-Type": "application/json",
    }
    if settings.LANGFLOW_API_KEY:
        headers["x-api-key"] = settings.LANGFLOW_API_KEY

    # Format input untuk node Chat Input di Langflow find_meals
    input_str = ", ".join(cleaned_ingredients)
    payload = {
        "input_value": input_str,
        "input_type": "chat",
        "output_type": "chat",
    }

    logger.info("Mengeksekusi flow Langflow find_meals (%s) dengan input: %s", flow_id, input_str)

    try:
        with httpx.Client(timeout=settings.LANGFLOW_TIMEOUT_SECONDS) as client:
            response = client.post(run_url, json=payload, headers=headers)
    except httpx.ConnectError as conn_err:
        logger.error("Gagal terhubung ke Langflow di %s: %s", base_url, conn_err)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Layanan Langflow tidak dapat dihubungi pada {base_url}. Pastikan server/container Langflow aktif.",
        )
    except httpx.TimeoutException as timeout_err:
        logger.error("Timeout eksekusi Langflow flow %s: %s", flow_id, timeout_err)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Eksekusi workflow rekomendasi Langflow melebihi batas waktu (timeout).",
        )

    if response.status_code != 200:
        error_detail = response.text[:300]
        logger.error("Langflow mengembalikan status error %d: %s", response.status_code, error_detail)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Langflow workflow gagal dieksekusi (HTTP {response.status_code}): {error_detail}",
        )

    try:
        raw_json = response.json()
    except Exception as e:
        logger.error("Respons dari Langflow bukan JSON yang valid: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Respons dari Langflow tidak dapat di-parse sebagai JSON.",
        )

    # Ekstraksi teks dari struktur output Langflow
    output_text = _extract_text_from_langflow_response(raw_json)
    cleaned_json_str = _clean_json_markdown(output_text)

    try:
        parsed_dict = json.loads(cleaned_json_str)
    except Exception as parse_err:
        logger.error("Output teks dari Langflow bukan JSON masakan yang valid: %s. Raw: %s", parse_err, output_text[:200])
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Format output resep dari Langflow tidak valid: {parse_err}",
        )

    # Validasi terhadap Pydantic schema M2
    try:
        recommendations_resp = RecommendationResponse.model_validate(parsed_dict)
    except Exception as val_err:
        logger.error("Validasi schema Pydantic gagal untuk output Langflow: %s", val_err)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Output Langflow tidak sesuai kontrak rekomendasi Nomz: {val_err}",
        )

    # Validasi integritas ketat: bahan_tersedia hanya boleh berisi bahan yang ada di input user
    for item in recommendations_resp.recommendations:
        sanitized_tersedia = []
        for b in item.bahan_tersedia:
            b_lower = b.lower().strip()
            # Cek kecocokan dengan input user
            if any(user_ing in b_lower or b_lower in user_ing for user_ing in cleaned_ingredients):
                sanitized_tersedia.append(b)
            else:
                if b not in item.bahan_tambahan:
                    item.bahan_tambahan.append(b)
        item.bahan_tersedia = sanitized_tersedia if sanitized_tersedia else [cleaned_ingredients[0]]

    logger.info(
        "Workflow Langflow find_meals BERHASIL menghasilkan %d rekomendasi masakan",
        len(recommendations_resp.recommendations),
    )
    return recommendations_resp
