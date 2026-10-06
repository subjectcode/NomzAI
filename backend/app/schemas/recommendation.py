import uuid
from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.video import VideoRecommendation


class RecommendationRequest(BaseModel):
    ingredients: List[str] = Field(
        ...,
        description="Daftar bahan makanan yang dimiliki/dikonfirmasi pengguna (beserta jumlah bila ada)",
        min_length=1,
    )
    mode: Optional[str] = Field(
        default="rescue",
        description="Mode rekomendasi: rescue, no_shopping, quick, simple, free",
    )
    constraint: Optional[str] = Field(
        default=None,
        description="Kendala atau preferensi khusus masakan (contoh: 'tanpa belanja', 'lebih cepat', 'Tumis')",
    )
    cooking_style: Optional[str] = Field(
        default=None,
        description="Gaya masak terpilih (contoh: 'Tumis', 'Goreng', 'Kukus', 'Rebus', 'Panggang', 'Air Fryer')",
    )


class RecipeRecommendationItem(BaseModel):
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Identifikasi unik rekomendasi resep",
    )
    nama: str = Field(
        ...,
        description="Nama hidangan masakan dalam Bahasa Indonesia (contoh: Tumis Ayam Brokoli Bawang Gurih)",
    )
    deskripsi: str = Field(
        ...,
        description="Deskripsi singkat masakan (1-2 kalimat)",
    )
    metode_masak: Optional[str] = Field(
        default=None,
        description="Metode masak utama hidangan (contoh: 'Tumis', 'Goreng', 'Kukus', 'Rebus', 'Panggang')",
    )
    bahan_tersedia: List[str] = Field(
        ...,
        description=(
            "Bahan masakan yang DIAMBIL DARI input pengguna, beserta takarannya (contoh: '2 butir telur', '150 g ayam fillet'). "
            "Jangan pernah mencantumkan bahan yang tidak ada di input pengguna."
        ),
    )
    bahan_tambahan: List[str] = Field(
        ...,
        description="Bahan pelengkap atau bumbu dasar tambahan umum beserta takarannya (contoh: '1 sdm minyak goreng', '2 siung bawang putih cincang', '1/2 sdt garam')",
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
        description="Alasan singkat mengapa hidangan ini sangat cocok dengan kombinasi bahan dan gaya masak",
    )
    langkah: List[str] = Field(
        default_factory=list,
        description="Langkah-langkah memasak teknis, terukur, dan berurutan untuk panduan memasak nyata",
    )
    porsi: str = Field(
        default="1-2 porsi",
        description="Estimasi porsi sajian",
    )
    videos: Optional[List[VideoRecommendation]] = Field(
        default=None,
        description="Rekomendasi video tutorial memasak yang relevan (bila diorkestrasi oleh flow)",
    )


class RecommendationResponse(BaseModel):
    recommendations: List[RecipeRecommendationItem]
    source: str = Field(default="langflow", description="Execution engine source (e.g. langflow, gemini)")
    flow_id: str | None = Field(default=None, description="Langflow Flow ID")
    videos: Optional[List[VideoRecommendation]] = Field(
        default=None,
        description="Pool video tutorial relevan yang dihasilkan langsung oleh orkestrasi Langflow",
    )
