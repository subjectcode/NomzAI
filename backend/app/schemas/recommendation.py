import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    ingredients: List[str] = Field(
        ...,
        description="Daftar bahan makanan yang dimiliki/dikonfirmasi pengguna",
        min_length=1,
    )
    mode: Optional[str] = Field(
        default="rescue",
        description="Mode rekomendasi: rescue, no_shopping, quick, simple, free",
    )
    constraint: Optional[str] = Field(
        default=None,
        description="Kendala atau preferensi khusus masakan (contoh: 'tanpa belanja', 'lebih cepat')",
    )


class RecipeRecommendationItem(BaseModel):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Identifikasi unik rekomendasi resep",
    )
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
    langkah: List[str] = Field(
        default_factory=list,
        description="Langkah-langkah memasak praktis dan berurutan",
    )
    porsi: str = Field(
        default="1-2 porsi",
        description="Estimasi porsi sajian",
    )


class RecommendationResponse(BaseModel):
    recommendations: List[RecipeRecommendationItem]
    source: str = Field(default="langflow", description="Execution engine source (e.g. langflow)")
    flow_id: str | None = Field(default=None, description="Langflow Flow ID")
