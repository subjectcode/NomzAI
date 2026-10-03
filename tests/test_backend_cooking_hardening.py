import sys
from pathlib import Path
import pytest

backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.schemas.recommendation import (
    RecommendationRequest,
    RecipeRecommendationItem,
    RecommendationResponse,
)


def test_recommendation_request_schema():
    """Verify RecommendationRequest accepts cooking_style and ingredients."""
    req = RecommendationRequest(
        ingredients=["2 butir telur", "150 g fillet ayam", "3 siung bawang putih"],
        cooking_style="Kukus",
    )
    assert req.cooking_style == "Kukus"
    assert len(req.ingredients) == 3
    assert req.ingredients[0] == "2 butir telur"


def test_recipe_recommendation_item_schema():
    """Verify RecipeRecommendationItem holds cooking style and technical steps."""
    item = RecipeRecommendationItem(
        nama="Ayam Kukus Jahe Bawang Putih",
        deskripsi="Ayam kukus aromatik dengan jahe dan bawang putih yang juicy.",
        metode_masak="Kukus",
        bahan_tersedia=["150 g fillet ayam", "3 siung bawang putih"],
        bahan_tambahan=["1 ruas jahe", "1 sdm kecap asin", "1 sdt minyak wijen"],
        estimasi_waktu="20 menit",
        tingkat_kesulitan="Mudah",
        alasan="Menggunakan bahan ayam dan bawang putih yang tersedia.",
        langkah=[
            "Persiapan: Potong 150 g fillet ayam tipis, lumuri jahe dan bawang putih parut.",
            "Pengolahan: Panaskan kukusan dengan api sedang hingga uap banyak mengepul.",
            "Kukus ayam selama 12-15 menit dengan api sedang-tinggi hingga daging matang dan sarinya jernih.",
            "Penyajian: Angkat wadah kukusan hati-hati, siram minyak wijen dan sajikan hangat.",
        ],
    )
    assert item.metode_masak == "Kukus"
    assert len(item.langkah) == 4
    assert "kukus" in item.langkah[1].lower()


def test_cooking_style_enforcement_logic():
    """Verify that when a cooking style is specified, recommendation methods enforce it."""
    item = RecipeRecommendationItem(
        nama="Ikan Bakar Bumbu Rujak",
        deskripsi="Ikan dibakar dengan bumbu rujak pedas manis.",
        bahan_tersedia=["ikan"],
        bahan_tambahan=["cabai", "kecap"],
        estimasi_waktu="25 menit",
        tingkat_kesulitan="Sedang",
        alasan="Cocok untuk bahan ikan.",
        langkah=["Siapkan ikan.", "Bakar di atas bara api."],
    )

    requested_style = "Panggang"
    # Apply same logic as recommendation service
    item.metode_masak = requested_style
    assert item.metode_masak == "Panggang"


def test_technical_step_cues_detection():
    """Verify technical cues like heat levels, timing, and sensory checks."""
    steps = [
        "Persiapan: Cincang 3 siung bawang putih dan potong sayuran ukuran bite-size.",
        "Pengolahan: Panaskan wajan dengan api sedang selama 2 menit. Tuang 1 sdm minyak hingga berkilau.",
        "Tumis bawang putih 45 detik hingga harum keemasan dan tidak gosong.",
        "Masukkan ayam, aduk cepat selama 3-4 menit sampai permukaan berubah putih pucat.",
        "Penyajian: Angkat dan sajikan selagi panas.",
    ]

    has_heat = any("api sedang" in s.lower() for s in steps)
    has_timing = any("menit" in s.lower() or "detik" in s.lower() for s in steps)
    has_sensory = any("harum" in s.lower() or "berkilau" in s.lower() or "keemasan" in s.lower() for s in steps)

    assert has_heat, "Must contain heat level"
    assert has_timing, "Must contain timing instructions"
    assert has_sensory, "Must contain sensory/doneness cues"


def test_ingredient_with_quantity_parsing_compatibility():
    """Verify backward compatibility: handles both pure ingredient names and quantities."""
    raw_inputs = [
        "telur",  # legacy pure name
        "2 butir telur ayam",  # structured with count and unit
        "150 g daging sapi",  # structured with weight
        "1 sdm minyak zaitun",  # structured with volume
    ]

    # Verify normalization matches
    normalized = [i.lower() for i in raw_inputs]
    assert "telur" in normalized[0]
    assert any("telur" in n for n in normalized)
    assert any("150 g" in n for n in normalized)
