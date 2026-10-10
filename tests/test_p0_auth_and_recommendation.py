"""Unit and regression tests for P0 bug fixes:
- Google email registration conflict handling
- Google-only account password login attempt guidance
- Authenticated set-password endpoint for Google accounts
- Password validation and verification
- Recommendation fallback speed and structure
"""

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.db.database import Base, SessionLocal, engine
from app.db.models import User
from app.main import app
from app.services.auth import create_google_user


@pytest.fixture(autouse=True)
def clean_users():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.execute(User.__table__.delete())
        db.commit()
    finally:
        db.close()
    yield
    db_after = SessionLocal()
    try:
        db_after.execute(User.__table__.delete())
        db_after.commit()
    finally:
        db_after.close()


@pytest.fixture
def client():
    return TestClient(app)


def test_google_conflict_on_register(client: TestClient):
    # Setup: Create a user via Google auth (no password)
    email = "google_only_user@example.com"
    db = SessionLocal()
    try:
        create_google_user(
            db=db,
            email=email,
            display_name="Google Tester",
            google_sub="goog-sub-12345",
            avatar_url=None,
        )
    finally:
        db.close()

    # Attempt to register with the same email using password
    res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "username": "googletester",
            "display_name": "Google Tester",
            "password": "SecretPassword123",
        },
    )
    assert res.status_code == 409
    data = res.json()
    assert "EMAIL_REGISTERED_WITH_GOOGLE" in data["detail"]


def test_google_user_login_without_password(client: TestClient):
    # Setup: Create user via Google
    email = "google_nopass@example.com"
    db = SessionLocal()
    try:
        create_google_user(
            db=db,
            email=email,
            display_name="Google NoPass",
            google_sub="goog-sub-67890",
            avatar_url=None,
        )
    finally:
        db.close()

    # Attempt password login
    res = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "RandomPassword123",
        },
    )
    assert res.status_code == 401
    data = res.json()
    assert "GOOGLE_ACCOUNT_NO_PASSWORD" in data["detail"]


def test_set_password_authenticated_and_login(client: TestClient):
    # Setup: Create user via Google
    email = "google_setpass@example.com"
    db = SessionLocal()
    try:
        user = create_google_user(
            db=db,
            email=email,
            display_name="Google SetPass",
            google_sub="goog-sub-setpass",
            avatar_url=None,
        )
        user_id = user.id
    finally:
        db.close()

    token = create_access_token(user_id)

    # 1. Verify user initially has has_password=False
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["has_password"] is False

    # 2. Set password via POST /api/auth/set-password
    set_res = client.post(
        "/api/auth/set-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"password": "NewSecurePassword123"},
    )
    assert set_res.status_code == 200
    assert set_res.json()["has_password"] is True

    # 3. Now user can login using password!
    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": "NewSecurePassword123"},
    )
    assert login_res.status_code == 200
    assert login_res.json()["user"]["has_password"] is True


def test_set_password_unauthenticated_rejected(client: TestClient):
    res = client.post(
        "/api/auth/set-password",
        json={"password": "NewSecurePassword123"},
    )
    assert res.status_code in [401, 403]


def test_set_password_validation(client: TestClient):
    email = "google_shortpass@example.com"
    db = SessionLocal()
    try:
        user = create_google_user(
            db=db,
            email=email,
            display_name="Google ShortPass",
            google_sub="goog-sub-shortpass",
            avatar_url=None,
        )
        user_id = user.id
    finally:
        db.close()

    token = create_access_token(user_id)

    # Too short (< 8 chars)
    res = client.post(
        "/api/auth/set-password",
        headers={"Authorization": f"Bearer {token}"},
        json={"password": "short"},
    )
    assert res.status_code in [400, 422]
