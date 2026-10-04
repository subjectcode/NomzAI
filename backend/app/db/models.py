import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Index, Integer, String, Text
from app.db.database import Base


class User(Base):
    """Model pengguna Nomz.

    Mendukung autentikasi via email/password dan Google Sign-In.
    Kolom password_hash bisa NULL untuk pengguna yang hanya login via Google.
    Kolom provider_id menyimpan Google sub ID (NULL untuk pengguna email).
    Kolom username bersifat unik dan case-insensitive.
    """

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_provider", "auth_provider", "provider_id"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=True, index=True)
    display_name = Column(String(100), nullable=False)
    password_hash = Column(Text, nullable=True)
    auth_provider = Column(String(20), nullable=False, default="email")
    provider_id = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    is_verified = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class EmailVerificationToken(Base):
    """Model token OTP verifikasi email untuk registrasi akun baru."""

    __tablename__ = "email_verification_tokens"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, index=True)
    otp_hash = Column(String(255), nullable=False)
    registration_data = Column(Text, nullable=True)  # JSON pending user details
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, nullable=False, default=0)
    max_attempts = Column(Integer, nullable=False, default=5)
    resend_available_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class VideoSearchCache(Base):
    """Cache for YouTube/Composio video recommendations."""
    __tablename__ = "video_search_cache"

    query = Column(String(255), primary_key=True)
    results = Column(Text, nullable=False)  # JSON encoded
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
