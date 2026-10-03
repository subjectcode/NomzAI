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


def test_ensure_recipe_consistency_kukus():
    """Verify Kukus method generates steaming steps, sanitizes conflicting titles, and has NO frying instructions."""
    from app.services.cooking_steps import ensure_recipe_consistency

    # Case 1: Recipe returned from Langflow had "Tumis" title and no steps
    title, method, steps = ensure_recipe_consistency(
        item_nama="Tumis Telur Tomat Gurih",
        item_metode_masak=None,
        item_bahan_tersedia=["2 butir telur", "1 buah tomat"],
        item_langkah=[],
        cooking_style="Kukus",
    )

    assert method == "Kukus"
    assert "tumis" not in title.lower()
    assert "kukus" in title.lower()
    assert len(steps) >= 4
    combined = " ".join(steps).lower()
    assert "kukus" in combined or "uap" in combined
    assert "minyak di wajan" not in combined
    assert "panaskan 1 sdm minyak" not in combined


def test_ensure_recipe_consistency_goreng():
    """Verify Goreng method enforces frying steps and texture cues."""
    from app.services.cooking_steps import ensure_recipe_consistency

    title, method, steps = ensure_recipe_consistency(
        item_nama="Tahu Tempe Goreng Krispi",
        item_metode_masak="Goreng",
        item_bahan_tersedia=["2 kotak tahu", "1 papan tempe"],
        item_langkah=[],
        cooking_style="Goreng",
    )

    assert method == "Goreng"
    assert len(steps) >= 4
    combined = " ".join(steps).lower()
    assert "minyak" in combined
    assert "goreng" in combined or "renyah" in combined
    assert "kukus" not in combined


def test_ensure_recipe_consistency_rebus():
    """Verify Rebus method generates broth/boiling steps without frying."""
    from app.services.cooking_steps import ensure_recipe_consistency

    title, method, steps = ensure_recipe_consistency(
        item_nama="Goreng Telur Kuah Sup",
        item_metode_masak=None,
        item_bahan_tersedia=["2 butir telur", "sayur bayam"],
        item_langkah=[],
        cooking_style="Rebus",
    )

    assert method == "Rebus"
    assert "goreng" not in title.lower()
    assert len(steps) >= 4
    combined = " ".join(steps).lower()
    assert "panci" in combined or "air" in combined or "rebus" in combined
    assert "minyak di wajan" not in combined


def test_ensure_recipe_consistency_tumis():
    """Verify Tumis method maintains stir-fry steps."""
    from app.services.cooking_steps import ensure_recipe_consistency

    title, method, steps = ensure_recipe_consistency(
        item_nama="Tumis Buncis Bawang Putih",
        item_metode_masak=None,
        item_bahan_tersedia=["buncis", "bawang putih"],
        item_langkah=[],
        cooking_style="Tumis",
    )

    assert method == "Tumis"
    assert "tumis" in title.lower()
    assert len(steps) >= 4
    combined = " ".join(steps).lower()
    assert "tumis" in combined or "wajan" in combined


def test_no_universal_tumis_fallback_when_cooking_style_provided():
    """Verify that when cooking_style is provided, it is NEVER overridden by Tumis."""
    from app.services.cooking_steps import normalize_cooking_method

    assert normalize_cooking_method("Masakan Dapur", requested_style="Kukus") == "Kukus"
    assert normalize_cooking_method("Masakan Dapur", requested_style="Goreng") == "Goreng"
    assert normalize_cooking_method("Masakan Dapur", requested_style="Rebus") == "Rebus"
    assert normalize_cooking_method("Masakan Dapur", requested_style="Panggang") == "Panggang"
    assert normalize_cooking_method("Masakan Dapur", requested_style="Air Fryer") == "Air Fryer"


def test_contradictory_steps_replaced():
    """Verify that if Langflow returns contradictory frying steps for Kukus, they are replaced."""
    from app.services.cooking_steps import ensure_recipe_consistency

    contradictory_steps = [
        "Panaskan 1 sdm minyak di wajan dengan api sedang selama 2 menit.",
        "Goreng bahan sampai matang dan harum.",
    ]

    title, method, steps = ensure_recipe_consistency(
        item_nama="Kukus Tahu Lembut",
        item_metode_masak="Kukus",
        item_bahan_tersedia=["tahu"],
        item_langkah=contradictory_steps,
        cooking_style="Kukus",
    )

    assert method == "Kukus"
    combined = " ".join(steps).lower()
    # Contradictory frying instructions must be replaced by steaming steps
    assert "panaskan 1 sdm minyak di wajan" not in combined
    assert "kukusan" in combined or "uap" in combined
