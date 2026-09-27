import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Index, String, Text
from app.db.database import Base


class User(Base):
    """Model pengguna Nomz.

    Mendukung autentikasi via email/password dan Google Sign-In.
    Kolom password_hash bisa NULL untuk pengguna yang hanya login via Google.
    Kolom provider_id menyimpan Google sub ID (NULL untuk pengguna email).
    """

    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_provider", "auth_provider", "provider_id"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    password_hash = Column(Text, nullable=True)
    auth_provider = Column(String(20), nullable=False, default="email")
    provider_id = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
