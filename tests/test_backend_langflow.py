import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.langflow import run_find_meals_flow
from app.core.config import settings

client = TestClient(app)


def test_langflow_direct_service_execution():
    """Verify that Langflow find_meals workflow executes directly and produces valid structured output."""
    ingredients = ["telur", "tomat", "daun basil"]
    result = run_find_meals_flow(ingredients)

    assert result is not None
    assert len(result.recommendations) >= 1

    input_lower = [i.lower() for i in ingredients]

    for rec in result.recommendations:
        assert isinstance(rec.nama, str) and len(rec.nama) > 0
        assert isinstance(rec.deskripsi, str) and len(rec.deskripsi) > 0
        assert len(rec.bahan_tersedia) >= 1
        assert isinstance(rec.bahan_tambahan, list)
        assert isinstance(rec.estimasi_waktu, str)
        assert isinstance(rec.tingkat_kesulitan, str)
        assert isinstance(rec.alasan, str)

        # Integrity check: bahan_tersedia must strictly belong to user input
        for b in rec.bahan_tersedia:
            b_clean = b.lower()
            assert any(u in b_clean or b_clean in u for u in input_lower), (
                f"bahan_tersedia '{b}' is not in user input {ingredients}"
            )


def test_fastapi_to_langflow_integration():
    """Verify that POST /api/recommendations routes through Langflow and returns verified engine headers."""
    payload = {"ingredients": ["telur", "tomat", "daun basil"]}
    response = client.post("/api/recommendations", json=payload)

    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    # Proof that response came from Langflow
    assert response.headers.get("x-recommendation-engine") == "langflow"
    assert response.headers.get("x-langflow-flow-id") == settings.LANGFLOW_FLOW_ID
    assert data.get("source") == "langflow"
    assert data.get("flow_id") == settings.LANGFLOW_FLOW_ID

    # Contract verification
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) >= 1


def test_langflow_empty_ingredients():
    """Verify validation when ingredients list is empty."""
    with pytest.raises(Exception):
        run_find_meals_flow([])
