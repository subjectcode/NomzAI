"""Comprehensive tests for Final Account, Auth, Data Isolation, Username & OTP Hardening."""

import sys
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient

from app.db.database import Base, SessionLocal, engine
from app.db.models import EmailVerificationToken, User
from app.main import app
from app.services.otp import hash_otp_code

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.query(EmailVerificationToken).delete()
        db.query(User).delete()
        db.commit()
    finally:
        db.close()

    yield

    db_after = SessionLocal()
    try:
        db_after.query(EmailVerificationToken).delete()
        db_after.query(User).delete()
        db_after.commit()
    finally:
        db_after.close()


# ── Username Validation & Uniqueness Tests ─────────────────────────────────


def test_register_with_valid_username():
    """Registrasi dengan username valid (4-20 char a-z, 0-9, _) berhasil."""
    payload = {
        "email": "ryan@nomz.dev",
        "username": "ryan_feb",
        "display_name": "Ryan Febriant",
        "password": "securepassword123",
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["username"] == "ryan_feb"
    assert data["user"]["email"] == "ryan@nomz.dev"
    assert data["user"]["display_name"] == "Ryan Febriant"


def test_register_duplicate_username_exact():
    """Username duplikat harus menghasilkan HTTP 409 Conflict."""
    payload1 = {
        "email": "user1@nomz.dev",
        "username": "ryanfeb",
        "display_name": "Ryan 1",
        "password": "password1234",
    }
    res1 = client.post("/api/auth/register", json=payload1)
    assert res1.status_code == 201

    payload2 = {
        "email": "user2@nomz.dev",
        "username": "ryanfeb",
        "display_name": "Ryan 2",
        "password": "password1234",
    }
    res2 = client.post("/api/auth/register", json=payload2)
    assert res2.status_code == 409
    assert "username sudah digunakan" in res2.json()["detail"].lower()


def test_register_duplicate_username_case_insensitive():
    """ryanfeb, RyanFeb, RYANFEB harus diperlakukan sama persis (Conflict 409)."""
    payload1 = {
        "email": "user1@nomz.dev",
        "username": "ryanfeb",
        "display_name": "Ryan 1",
        "password": "password1234",
    }
    res1 = client.post("/api/auth/register", json=payload1)
    assert res1.status_code == 201

    for variant in ["RyanFeb", "RYANFEB", "  ryanfeb  "]:
        payload_var = {
            "email": f"diff_{variant.strip().lower()}@nomz.dev",
            "username": variant,
            "display_name": "Variant User",
            "password": "password1234",
        }
        res_var = client.post("/api/auth/register", json=payload_var)
        assert res_var.status_code == 409, f"Variant {variant} should conflict with 409"
        assert "username sudah digunakan" in res_var.json()["detail"].lower()


def test_register_username_rejects_spaces_and_special_chars():
    """Username dengan spasi, tanda baca selain underscore ditolak (422)."""
    invalid_usernames = [
        "ryan feb",  # Ada spasi
        "ryan-feb",  # Hyphen
        "@ryanfeb",  # At sign
        "ryanfeb!",  # Tanda seru
        "ry",        # Terlalu pendek (< 4)
        "a" * 21,    # Terlalu panjang (> 20)
        "",          # Kosong
    ]
    for bad_u in invalid_usernames:
        payload = {
            "email": "test@nomz.dev",
            "username": bad_u,
            "display_name": "Test User",
            "password": "password1234",
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 422, f"Username '{bad_u}' should be rejected with 422"


def test_register_invalid_display_name():
    """Nama lengkap kosong atau hanya spasi harus ditolak (422)."""
    for bad_name in ["", "   ", "\t\n"]:
        payload = {
            "email": "test@nomz.dev",
            "username": "valid_user",
            "display_name": bad_name,
            "password": "password1234",
        }
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 422


def test_register_duplicate_email_case_insensitive():
    """Email yang sama dengan huruf kapital berbeda harus ditolak (409)."""
    payload1 = {
        "email": "test@example.com",
        "username": "user_one",
        "display_name": "User One",
        "password": "password1234",
    }
    res1 = client.post("/api/auth/register", json=payload1)
    assert res1.status_code == 201

    payload2 = {
        "email": "TEST@example.com",
        "username": "user_two",
        "display_name": "User Two",
        "password": "password1234",
    }
    res2 = client.post("/api/auth/register", json=payload2)
    assert res2.status_code == 409
    assert "email sudah terdaftar" in res2.json()["detail"].lower()


# ── Profile Update & Avatar Tests ──────────────────────────────────────────


def test_profile_update_username_success_and_conflict():
    """Memperbarui username melalui PATCH /api/auth/me memvalidasi format dan keunikan."""
    # Register User A
    res_a = client.post("/api/auth/register", json={
        "email": "usera@nomz.dev",
        "username": "user_alpha",
        "display_name": "User Alpha",
        "password": "password1234",
    })
    token_a = res_a.json()["access_token"]

    # Register User B
    res_b = client.post("/api/auth/register", json={
        "email": "userb@nomz.dev",
        "username": "user_beta",
        "display_name": "User Beta",
        "password": "password1234",
    })
    token_b = res_b.json()["access_token"]

    # User B mencoba mengganti username menjadi user_alpha -> Conflict 409
    patch_conflict = client.patch(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"username": "user_alpha"},
    )
    assert patch_conflict.status_code == 409

    # User B mengganti ke username unik baru -> Success 200
    patch_success = client.patch(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"username": "beta_hero", "avatar_url": "data:image/jpeg;base64,mockphoto"},
    )
    assert patch_success.status_code == 200
    assert patch_success.json()["username"] == "beta_hero"
    assert patch_success.json()["avatar_url"] == "data:image/jpeg;base64,mockphoto"


# ── Account Isolation Tests ────────────────────────────────────────────────


def test_account_data_isolation():
    """Memastikan profil dan sesi Akun A dan Akun B tidak saling bercampur."""
    # Create Account A
    res_a = client.post("/api/auth/register", json={
        "email": "account_a@nomz.dev",
        "username": "account_a",
        "display_name": "Account A",
        "password": "password1234",
    })
    token_a = res_a.json()["access_token"]
    user_id_a = res_a.json()["user"]["id"]

    # Set Avatar for A
    client.patch(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"avatar_url": "https://nomz.app/avatar_a.jpg"},
    )

    # Create Account B
    res_b = client.post("/api/auth/register", json={
        "email": "account_b@nomz.dev",
        "username": "account_b",
        "display_name": "Account B",
        "password": "password1234",
    })
    token_b = res_b.json()["access_token"]
    user_id_b = res_b.json()["user"]["id"]

    # Verify ID different
    assert user_id_a != user_id_b

    # Verify Me A
    me_a = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert me_a["username"] == "account_a"
    assert me_a["avatar_url"] == "https://nomz.app/avatar_a.jpg"

    # Verify Me B (Genuinely clean)
    me_b = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert me_b["username"] == "account_b"
    assert me_b["avatar_url"] is None
    assert me_b["email"] == "account_b@nomz.dev"


# ── OTP Verification Flow Tests ─────────────────────────────────────────────


def test_otp_send_and_verify_flow():
    """Menguji siklus pengiriman OTP dan verifikasi kode valid."""
    email = "verification@nomz.dev"

    # 1. Kirim OTP
    send_res = client.post("/api/auth/otp/send", json={"email": email})
    assert send_res.status_code == 200
    assert send_res.json()["success"] is True

    # Ambil token dari DB untuk mendapatkan kode OTP plaintext dalam pengujian
    db = SessionLocal()
    token = db.query(EmailVerificationToken).filter(EmailVerificationToken.email == email).first()
    assert token is not None
    assert token.is_used is False
    assert token.attempts == 0

    # Uji verifikasi dengan hash yang benar
    # Temukan kode yang cocok dengan hash untuk pengetesan
    found_code = None
    for c in range(1000000):
        code_str = f"{c:06d}"
        if hash_otp_code(code_str, email) == token.otp_hash:
            found_code = code_str
            break
        if c > 2000:
            break

    # Jika tidak loop sampai 1M, inject known code
    if not found_code:
        known_code = "123456"
        token.otp_hash = hash_otp_code(known_code, email)
        db.commit()
        found_code = known_code
    db.close()

    # 2. Verifikasi dengan kode yang benar
    verify_res = client.post("/api/auth/otp/verify", json={"email": email, "otp": found_code})
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True


def test_otp_wrong_code_increments_attempts():
    """Kode OTP salah harus ditolak (400) dan menaikkan counter percobaan."""
    email = "wrong_otp@nomz.dev"
    client.post("/api/auth/otp/send", json={"email": email})

    verify_res = client.post("/api/auth/otp/verify", json={"email": email, "otp": "000000"})
    assert verify_res.status_code == 400
    assert "kode otp salah" in verify_res.json()["detail"].lower()

    db = SessionLocal()
    token = db.query(EmailVerificationToken).filter(EmailVerificationToken.email == email).first()
    assert token.attempts == 1
    db.close()


def test_otp_expired_code_rejected():
    """Kode OTP yang sudah kedaluwarsa harus ditolak dengan 400."""
    email = "expired@nomz.dev"
    client.post("/api/auth/otp/send", json={"email": email})

    db = SessionLocal()
    token = db.query(EmailVerificationToken).filter(EmailVerificationToken.email == email).first()
    token.expires_at = datetime.utcnow() - timedelta(minutes=1)
    db.commit()
    db.close()

    verify_res = client.post("/api/auth/otp/verify", json={"email": email, "otp": "123456"})
    assert verify_res.status_code == 400
    assert "kedaluwarsa" in verify_res.json()["detail"].lower()


def test_otp_resend_cooldown_enforced():
    """Pengiriman ulang sebelum 60 detik cooldown harus ditolak dengan 429."""
    email = "cooldown@nomz.dev"
    res1 = client.post("/api/auth/otp/send", json={"email": email})
    assert res1.status_code == 200

    res2 = client.post("/api/auth/otp/resend", json={"email": email})
    assert res2.status_code == 429
    assert "tunggu" in res2.json()["detail"].lower()
