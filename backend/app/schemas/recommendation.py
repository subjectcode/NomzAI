from typing import List
from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    ingredients: List[str] = Field(
        ...,
        description="Daftar bahan makanan yang dimiliki/dikonfirmasi pengguna",
        min_length=1,
    )


class RecipeRecommendationItem(BaseModel):
    nama: str = Field(
        ...,
        description="Nama hidangan masakan dalam Bahasa Indonesia (contoh: Telur Dadar Tomat Basil)",
    )
    deskripsi: str = Field(
        ...,
        description="Deskripsi singkat masakan (1-2 kalimat)",
    )
    bahan_tersedia: List[str] = Field(
        ...,
        description=(
            "Bahan masakan yang DIAMBIL DARI input pengguna. "
            "Jangan pernah mencantumkan bahan yang tidak ada di input pengguna."
        ),
    )
    bahan_tambahan: List[str] = Field(
        ...,
        description="Bahan pelengkap atau bumbu dasar tambahan yang umum (contoh: minyak goreng, garam, merica, bawang putih)",
    )
    estimasi_waktu: str = Field(
        ...,
        description="Estimasi waktu memasak (contoh: '15 menit', '25 menit')",
    )
    tingkat_kesulitan: str = Field(
        ...,
        description="Tingkat kesulitan memasak (Mudah / Sedang / Sulit)",
    )
    alasan: str = Field(
        ...,
        description="Alasan singkat mengapa hidangan ini sangat cocok dengan kombinasi bahan yang dimiliki pengguna",
    )


class RecommendationResponse(BaseModel):
    recommendations: List[RecipeRecommendationItem]
    source: str = Field(default="langflow", description="Execution engine source (e.g. langflow)")
    flow_id: str | None = Field(default=None, description="Langflow Flow ID")
