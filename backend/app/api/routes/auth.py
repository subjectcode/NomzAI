"""Route autentikasi Nomz — register, login, Google Sign-In, dan profil."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import (
    AuthResponse,
    GoogleAuthRequest,
    UserCreate,
    UserLogin,
    UserPublic,
)
from app.services.auth import (
    create_email_user,
    create_google_user,
    get_user_by_email,
    get_user_by_provider,
    verify_google_id_token,
    verify_password,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mendaftarkan pengguna baru dengan email dan password",
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Membuat akun pengguna baru. Mengembalikan access token jika berhasil."""
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah terdaftar.",
        )

    user = create_email_user(db, payload.email, payload.display_name, payload.password)
    token = create_access_token(user.id)

    return AuthResponse(
        access_token=token,
        user=UserPublic.model_validate(user),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login dengan email dan password",
)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Memverifikasi kredensial dan mengembalikan access token."""
    user = get_user_by_email(db, payload.email)
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
        )

    token = create_access_token(user.id)

    return AuthResponse(
        access_token=token,
        user=UserPublic.model_validate(user),
    )


@router.post(
    "/google",
    response_model=AuthResponse,
    summary="Login atau register via Google Sign-In",
)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Memverifikasi Google id_token, membuat pengguna jika belum ada,
    dan mengembalikan access token.
    """
    try:
        id_info = verify_google_id_token(payload.id_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    google_sub = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name", email)
    picture = id_info.get("picture")

    if not google_sub or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token tidak mengandung informasi yang cukup.",
        )

    # Cari pengguna berdasarkan Google sub ID
    user = get_user_by_provider(db, "google", google_sub)

    if not user:
        # Cek apakah email sudah terdaftar via email/password
        existing_email_user = get_user_by_email(db, email)
        if existing_email_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email sudah terdaftar dengan metode login lain. Silakan login dengan email dan password.",
            )

        user = create_google_user(db, email, name, google_sub, picture)

    token = create_access_token(user.id)

    return AuthResponse(
        access_token=token,
        user=UserPublic.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Mendapatkan profil pengguna yang sedang login",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Mengembalikan data profil pengguna berdasarkan token yang aktif."""
    return UserPublic.model_validate(current_user)
