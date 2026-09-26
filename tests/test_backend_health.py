import os
import sys
from pathlib import Path

# Add backend directory to sys.path so app modules are discoverable
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.db.database import SessionLocal, engine


client = TestClient(app)


def test_database_direct_connection():
    """Verify that SQLite connection works and executes queries."""
    with SessionLocal() as db:
        result = db.execute(text("SELECT 1")).scalar()
        assert result == 1, f"Expected 1, got {result}"


def test_api_health_endpoint():
    """Verify that GET /api/health returns the expected response schema and database is connected."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    assert data.get("service") == "nomz-api"
    assert data.get("database") == "connected"


def test_root_endpoint():
    """Verify that GET / returns welcome metadata and links to docs and health."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data.get("service") == "nomz-api"
    assert data.get("status") == "online"
    assert "/api/health" in data.get("health", "")
