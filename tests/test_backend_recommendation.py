import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)


def test_recommendations_with_valid_ingredients():
    """Verify that submitting confirmed ingredients returns structured food recommendations."""
    payload = {
        "ingredients": ["telur", "tomat", "daun basil"]
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    data = response.json()
    assert "recommendations" in data, "Response must contain 'recommendations' key"
    assert isinstance(data["recommendations"], list), "'recommendations' must be a list"
    assert len(data["recommendations"]) >= 1, "Should return at least 1 recommendation"

    user_input_normalized = [i.lower() for i in payload["ingredients"]]

    for recipe in data["recommendations"]:
        assert "nama" in recipe and isinstance(recipe["nama"], str) and len(recipe["nama"].strip()) > 0
        assert "deskripsi" in recipe and isinstance(recipe["deskripsi"], str) and len(recipe["deskripsi"].strip()) > 0
        assert "bahan_tersedia" in recipe and isinstance(recipe["bahan_tersedia"], list) and len(recipe["bahan_tersedia"]) > 0
        assert "bahan_tambahan" in recipe and isinstance(recipe["bahan_tambahan"], list)
        assert "estimasi_waktu" in recipe and isinstance(recipe["estimasi_waktu"], str) and len(recipe["estimasi_waktu"].strip()) > 0
        assert "tingkat_kesulitan" in recipe and isinstance(recipe["tingkat_kesulitan"], str) and len(recipe["tingkat_kesulitan"].strip()) > 0
        assert "alasan" in recipe and isinstance(recipe["alasan"], str) and len(recipe["alasan"].strip()) > 0

        # Verify that bahan_tersedia only contains items related to the user input
        for b in recipe["bahan_tersedia"]:
            b_clean = b.lower()
            assert any(u in b_clean or b_clean in u for u in user_input_normalized), (
                f"bahan_tersedia '{b}' is not in user input {payload['ingredients']}"
            )

    print("\nReceived recommendations:")
    for r in data["recommendations"]:
        print(f"- {r['nama']} ({r['estimasi_waktu']}, {r['tingkat_kesulitan']})")
        print(f"  Bahan tersedia: {r['bahan_tersedia']}")
        print(f"  Bahan tambahan: {r['bahan_tambahan']}")


def test_recommendations_empty_ingredients():
    """Verify that an empty ingredients list returns 400 Bad Request or 422 Validation Error."""
    response = client.post("/api/recommendations", json={"ingredients": []})
    assert response.status_code in [400, 422]

    response_spaces = client.post("/api/recommendations", json={"ingredients": ["  ", ""]})
    assert response_spaces.status_code == 400


def test_recommendations_alias_endpoint():
    """Verify that /api/recipes/recommend alias endpoint works with fruit ingredients."""
    payload = {
        "ingredients": ["pisang", "apel hijau", "stroberi"]
    }
    response = client.post("/api/recipes/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data.get("recommendations", [])) >= 1
