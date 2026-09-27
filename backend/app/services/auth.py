"""Layanan autentikasi Nomz — password hashing dan verifikasi Google id_token."""

import logging

import bcrypt
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import User

logger = logging.getLogger(__name__)


def hash_password(plain_password: str) -> str:
    """Meng-hash password menggunakan bcrypt."""
    pw_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Memverifikasi password terhadap hash bcrypt."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_user_by_email(db: Session, email: str) -> User | None:
    """Mengambil pengguna berdasarkan email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_provider(db: Session, provider: str, provider_id: str) -> User | None:
    """Mengambil pengguna berdasarkan auth provider dan provider_id."""
    return (
        db.query(User)
        .filter(User.auth_provider == provider, User.provider_id == provider_id)
        .first()
    )


def create_email_user(db: Session, email: str, display_name: str, password: str) -> User:
    """Membuat pengguna baru dengan autentikasi email/password."""
    user = User(
        email=email,
        display_name=display_name,
        password_hash=hash_password(password),
        auth_provider="email",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Pengguna email baru dibuat: %s", email)
    return user


def create_google_user(
    db: Session, email: str, display_name: str, google_sub: str, avatar_url: str | None = None
) -> User:
    """Membuat pengguna baru dari Google Sign-In."""
    user = User(
        email=email,
        display_name=display_name,
        auth_provider="google",
        provider_id=google_sub,
        avatar_url=avatar_url,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Pengguna Google baru dibuat: %s (sub: %s)", email, google_sub)
    return user


def verify_google_id_token(token: str) -> dict:
    """Memverifikasi Google id_token menggunakan library google-auth.

    Mengembalikan dict berisi klaim token (email, sub, name, picture, dll.)
    atau raise ValueError jika token tidak valid.
    """
    client_id = settings.GOOGLE_CLIENT_ID
    if not client_id:
        raise ValueError("GOOGLE_CLIENT_ID belum dikonfigurasi di server.")

    try:
        id_info = google_id_token.verify_oauth2_token(
            token, GoogleRequest(), client_id
        )
    except Exception as e:
        logger.warning("Verifikasi Google id_token gagal: %s", e)
        raise ValueError(f"Google id_token tidak valid: {e}")

    # Pastikan token berasal dari Google accounts
    issuer = id_info.get("iss", "")
    if issuer not in ("accounts.google.com", "https://accounts.google.com"):
        raise ValueError(f"Issuer token tidak valid: {issuer}")

    return id_info
