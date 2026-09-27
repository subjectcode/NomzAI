"""Tests M5.2B — Backend Auth Foundation.

Menguji:
- Registrasi pengguna baru (email/password)
- Login dengan kredensial valid
- Login dengan kredensial salah
- Registrasi duplikat email
- GET /auth/me dengan token valid
- GET /auth/me tanpa token
- Verifikasi JWT token
"""

import sys
from pathlib import Path

# Add backend directory to sys.path so app modules are discoverable
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.database import Base, engine
from app.main import app

client = TestClient(app)

# ── Fixtures ────────────────────────────────────────────────────────────────

_test_user = {
    "email": "test@nomz.dev",
    "display_name": "Test User Nomz",
    "password": "password123secure",
}


@pytest.fixture(autouse=True)
def reset_users_table():
    """Membersihkan tabel users sebelum setiap test agar terisolasi."""
    from app.db.models import User  # noqa: F401  (ensure model is registered)

    Base.metadata.create_all(bind=engine)
    yield
    # Hapus semua data user setelah test
    from sqlalchemy.orm import Session
    from app.db.database import SessionLocal

    db: Session = SessionLocal()
    try:
        db.execute(User.__table__.delete())
        db.commit()
    finally:
        db.close()


# ── Test Register ───────────────────────────────────────────────────────────


def test_register_success():
    """Registrasi pengguna baru harus mengembalikan 201 + access_token + user data."""
    response = client.post("/api/auth/register", json=_test_user)

    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == _test_user["email"]
    assert data["user"]["display_name"] == _test_user["display_name"]
    assert data["user"]["auth_provider"] == "email"
    assert "id" in data["user"]


def test_register_duplicate_email():
    """Registrasi dengan email yang sudah terdaftar harus mengembalikan 409."""
    client.post("/api/auth/register", json=_test_user)
    response = client.post("/api/auth/register", json=_test_user)

    assert response.status_code == 409
    assert "sudah terdaftar" in response.json()["detail"].lower()


def test_register_weak_password():
    """Registrasi dengan password terlalu pendek harus ditolak (422 validation)."""
    weak = {**_test_user, "password": "short"}
    response = client.post("/api/auth/register", json=weak)
    assert response.status_code == 422


def test_register_invalid_email():
    """Registrasi dengan email tidak valid harus ditolak (422 validation)."""
    bad_email = {**_test_user, "email": "bukan-email"}
    response = client.post("/api/auth/register", json=bad_email)
    assert response.status_code == 422


# ── Test Login ──────────────────────────────────────────────────────────────


def test_login_success():
    """Login dengan kredensial valid harus mengembalikan 200 + access_token."""
    client.post("/api/auth/register", json=_test_user)

    login_payload = {"email": _test_user["email"], "password": _test_user["password"]}
    response = client.post("/api/auth/login", json=login_payload)

    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == _test_user["email"]


def test_login_wrong_password():
    """Login dengan password salah harus mengembalikan 401."""
    client.post("/api/auth/register", json=_test_user)

    response = client.post(
        "/api/auth/login",
        json={"email": _test_user["email"], "password": "wrongpassword123"},
    )
    assert response.status_code == 401


def test_login_nonexistent_email():
    """Login dengan email yang tidak terdaftar harus mengembalikan 401."""
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@nomz.dev", "password": "somepassword123"},
    )
    assert response.status_code == 401


# ── Test /auth/me ───────────────────────────────────────────────────────────


def test_me_with_valid_token():
    """GET /auth/me dengan token valid harus mengembalikan profil pengguna."""
    reg = client.post("/api/auth/register", json=_test_user)
    token = reg.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == _test_user["email"]
    assert data["display_name"] == _test_user["display_name"]


def test_me_without_token():
    """GET /auth/me tanpa token harus mengembalikan 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_with_invalid_token():
    """GET /auth/me dengan token rusak harus mengembalikan 401."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401


def test_me_with_expired_token():
    """GET /auth/me dengan token yang sudah kedaluwarsa harus mengembalikan 401."""
    reg = client.post("/api/auth/register", json=_test_user)
    user_id = reg.json()["user"]["id"]

    # Buat token kedaluwarsa secara manual
    expired_time = datetime.now(timezone.utc) - timedelta(hours=1)
    payload = {
        "sub": user_id,
        "exp": expired_time,
        "iat": datetime.now(timezone.utc) - timedelta(hours=2),
    }
    expired_token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
    assert "kedaluwarsa" in response.json()["detail"].lower()


def test_me_with_malformed_auth_header():
    """Header Authorization non-Bearer atau malformed harus ditolak dengan 401."""
    reg = client.post("/api/auth/register", json=_test_user)
    valid_token = reg.json()["access_token"]

    malformed_headers = [
        {"Authorization": "Basic dXNlcjpwYXNz"},
        {"Authorization": "Bearer"},
        {"Authorization": "Bearer "},
        {"Authorization": f"Token {valid_token}"},
        {"Authorization": "JustSomeRandomString"},
        {"Authorization": ""},
    ]

    for headers in malformed_headers:
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401, f"Expected 401 for header {headers}, got {response.status_code}"


def test_password_hash_never_exposed():
    """password_hash tidak boleh muncul pada respons register, login, maupun /me."""
    # 1. Register
    reg_res = client.post("/api/auth/register", json=_test_user)
    assert reg_res.status_code == 201
    reg_json = reg_res.json()
    assert "password_hash" not in reg_json
    assert "password_hash" not in reg_json["user"]
    assert "password" not in reg_json
    assert "password" not in reg_json["user"]

    token = reg_json["access_token"]

    # 2. Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": _test_user["email"], "password": _test_user["password"]},
    )
    assert login_res.status_code == 200
    login_json = login_res.json()
    assert "password_hash" not in login_json
    assert "password_hash" not in login_json["user"]
    assert "password" not in login_json
    assert "password" not in login_json["user"]

    # 3. GET /me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_json = me_res.json()
    assert "password_hash" not in me_json
    assert "password" not in me_json


# ── Test JWT Token Integrity ────────────────────────────────────────────────


def test_token_works_across_requests():
    """Token dari register harus bisa digunakan untuk login flow berikutnya."""
    # Register
    reg = client.post("/api/auth/register", json=_test_user)
    token = reg.json()["access_token"]

    # Gunakan token untuk /me
    me1 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me1.status_code == 200

    # Login → dapatkan token baru
    login_res = client.post(
        "/api/auth/login",
        json={"email": _test_user["email"], "password": _test_user["password"]},
    )
    token2 = login_res.json()["access_token"]

    # Token baru juga harus valid
    me2 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token2}"})
    assert me2.status_code == 200
    assert me2.json()["email"] == _test_user["email"]


# ── Test Google Sign-In ──────────────────────────────────────────────────────


from unittest.mock import patch


def test_google_auth_new_user():
    """Google auth untuk pengguna baru harus membuat akun dan mengembalikan token."""
    mock_claims = {
        "sub": "google-sub-12345",
        "email": "googleuser@nomz.dev",
        "name": "Nomz Google User",
        "picture": "https://lh3.googleusercontent.com/avatar",
    }
    with patch("app.api.routes.auth.verify_google_id_token", return_value=mock_claims):
        response = client.post("/api/auth/google", json={"id_token": "mock.google.id_token"})

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "googleuser@nomz.dev"
    assert data["user"]["auth_provider"] == "google"
    assert data["user"]["avatar_url"] == "https://lh3.googleusercontent.com/avatar"


def test_google_auth_returning_user():
    """Google auth untuk pengguna lama harus berhasil login tanpa duplikasi."""
    mock_claims = {
        "sub": "google-sub-repeat",
        "email": "returning@nomz.dev",
        "name": "Returning User",
    }
    with patch("app.api.routes.auth.verify_google_id_token", return_value=mock_claims):
        res1 = client.post("/api/auth/google", json={"id_token": "token1"})
        assert res1.status_code == 200
        user_id_1 = res1.json()["user"]["id"]

        res2 = client.post("/api/auth/google", json={"id_token": "token2"})
        assert res2.status_code == 200
        user_id_2 = res2.json()["user"]["id"]

    assert user_id_1 == user_id_2


def test_google_auth_invalid_token():
    """Google auth dengan token tidak valid harus mengembalikan 401."""
    with patch(
        "app.api.routes.auth.verify_google_id_token",
        side_effect=ValueError("Token signature is invalid"),
    ):
        response = client.post("/api/auth/google", json={"id_token": "bad_token"})

    assert response.status_code == 401
    assert "Token signature is invalid" in response.json()["detail"]


def test_google_auth_conflict_with_email_account():
    """Google auth dengan email yang sudah ada akun password-nya harus 409."""
    # Buat akun email terlebih dahulu
    client.post("/api/auth/register", json=_test_user)

    mock_claims = {
        "sub": "google-sub-conflict",
        "email": _test_user["email"],
        "name": "Duplicate Email User",
    }
    with patch("app.api.routes.auth.verify_google_id_token", return_value=mock_claims):
        response = client.post("/api/auth/google", json={"id_token": "token"})

    assert response.status_code == 409
    assert "terdaftar dengan metode login lain" in response.json()["detail"]
