import io
import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

SAMPLE_INGREDIENTS_IMAGE = Path(__file__).resolve().parent / "images" / "sample_ingredients.jpg"
SAMPLE_FRUITS_IMAGE = Path(__file__).resolve().parent / "images" / "sample_fruits.jpg"


def test_detect_ingredients_valid_image():
    """Verify that uploading a valid food image returns structured ingredients with name and confidence."""
    assert SAMPLE_INGREDIENTS_IMAGE.exists(), f"Sample image missing at {SAMPLE_INGREDIENTS_IMAGE}"

    with open(SAMPLE_INGREDIENTS_IMAGE, "rb") as img_file:
        files = {"file": ("sample_ingredients.jpg", img_file, "image/jpeg")}
        response = client.post("/api/vision/detect-ingredients", files=files)

    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert "ingredients" in data, "Response must contain 'ingredients' key"
    assert isinstance(data["ingredients"], list), "'ingredients' must be a list"
    assert len(data["ingredients"]) > 0, "Should detect at least 1 ingredient in sample image"

    for item in data["ingredients"]:
        assert "name" in item, "Item must have 'name'"
        assert isinstance(item["name"], str), "Ingredient name must be string"
        assert len(item["name"].strip()) > 0, "Ingredient name must not be empty"
        assert "confidence" in item, "Item must have 'confidence'"
        assert isinstance(item["confidence"], (int, float)), "Confidence must be a number"
        assert 0.0 <= item["confidence"] <= 1.0, f"Confidence {item['confidence']} out of bounds"

    detected_names = [i["name"].lower() for i in data["ingredients"]]
    print("Detected ingredients (Indonesian):", detected_names)
    # Check that at least one of the prominent items in the image is detected in Indonesian
    assert any(expected in " ".join(detected_names) for expected in ["telur", "tomat", "basil"])


def test_detect_ingredients_invalid_mime_type():
    """Verify that uploading a non-image file (e.g. text/plain) returns 400 Bad Request."""
    dummy_text = b"This is not an image file"
    files = {"file": ("notes.txt", io.BytesIO(dummy_text), "text/plain")}
    response = client.post("/api/vision/detect-ingredients", files=files)

    assert response.status_code == 400
    assert "Invalid file type" in response.json().get("detail", "")


def test_detect_ingredients_corrupted_image():
    """Verify that uploading a fake image (wrong magic bytes) returns 400 Bad Request."""
    fake_image_bytes = b"\x00\x01\x02\x03\x04\x05\x06\x07corrupted_data"
    files = {"file": ("corrupted.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}
    response = client.post("/api/vision/detect-ingredients", files=files)

    assert response.status_code == 400
    assert "valid or readable image" in response.json().get("detail", "")


def test_detect_ingredients_empty_file():
    """Verify that uploading an empty file returns 400 Bad Request."""
    files = {"file": ("empty.jpg", io.BytesIO(b""), "image/jpeg")}
    response = client.post("/api/vision/detect-ingredients", files=files)

    assert response.status_code == 400
    assert "empty" in response.json().get("detail", "").lower()
