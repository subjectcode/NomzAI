"""Route autentikasi Nomz — register, login, Google Sign-In, profil, dan OTP."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import (
    AuthResponse,
    GoogleAuthRequest,
    OTPRequest,
    OTPVerifyRequest,
    SetPasswordRequest,
    UserCreate,
    UserLogin,
    UserPublic,
    UserUpdate,
)
from app.services.auth import (
    create_email_user,
    create_google_user,
    get_user_by_email,
    get_user_by_provider,
    get_user_by_username,
    hash_password,
    verify_google_id_token,
    verify_password,
)
from app.services.otp import request_otp, verify_otp

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mendaftarkan pengguna baru dengan email, username, dan password",
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Membuat akun pengguna baru. Mengembalikan access token jika berhasil.

    Memvalidasi keunikan email dan username secara independen di tingkat database.
    """
    # 1. Validasi keunikan email
    existing_email = get_user_by_email(db, payload.email)
    if existing_email:
        if existing_email.auth_provider == "google" and not existing_email.password_hash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="EMAIL_REGISTERED_WITH_GOOGLE: Email ini sudah terdaftar menggunakan Google Sign-In. Silakan masuk menggunakan Google.",
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah terdaftar. Silakan masuk dengan email dan password Anda.",
        )

    # 2. Validasi keunikan username (jika disediakan)
    if payload.username:
        existing_username = get_user_by_username(db, payload.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username sudah digunakan.",
            )

    user = create_email_user(
        db=db,
        email=payload.email,
        display_name=payload.display_name,
        password=payload.password,
        username=payload.username,
    )
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
    if user and not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GOOGLE_ACCOUNT_NO_PASSWORD: Akun ini terdaftar melalui Google Sign-In. Silakan gunakan tombol Masuk dengan Google atau atur password di Pengaturan.",
        )

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
    "/set-password",
    response_model=UserPublic,
    summary="Membuat atau memperbarui password akun yang sedang login",
)
def set_password(
    payload: SetPasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mengizinkan akun yang sedang terautentikasi (seperti pengguna Google)
    untuk menambahkan atau memperbarui password login email/password.
    """
    current_user.password_hash = hash_password(payload.password)
    db.commit()
    db.refresh(current_user)
    logger.info("Pengguna %s berhasil memperbarui password login", current_user.id)
    return UserPublic.model_validate(current_user)


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


@router.patch(
    "/me",
    response_model=UserPublic,
    summary="Memperbarui profil pengguna yang sedang login",
)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Memperbarui data display_name, username, atau avatar_url pengguna."""
    if payload.display_name is not None:
        trimmed = payload.display_name.strip()
        if not trimmed:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Nama tampilan tidak boleh kosong.",
            )
        current_user.display_name = trimmed

    if payload.username is not None:
        cleaned_username = payload.username.strip().lower()
        existing = get_user_by_username(db, cleaned_username)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username sudah digunakan.",
            )
        current_user.username = cleaned_username

    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url.strip() if payload.avatar_url else None

    db.commit()
    db.refresh(current_user)
    return UserPublic.model_validate(current_user)


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Menghapus akun pengguna yang sedang login secara permanen",
)
def delete_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Menghapus record akun pengguna saat ini dari database."""
    db.delete(current_user)
    db.commit()
    return None


# ── OTP Verification Endpoints ──────────────────────────────────────────────


@router.post(
    "/otp/send",
    summary="Mengirim kode OTP verifikasi ke email",
)
def send_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    """Menghasilkan kode OTP 6-digit dan mengirimkannya melalui email."""
    result = request_otp(db, payload.email)
    return result


@router.post(
    "/otp/verify",
    summary="Memverifikasi kode OTP yang dimasukkan pengguna",
)
def verify_otp_endpoint(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Memverifikasi kode OTP dan mengonfirmasi status kepemilikan email."""
    token_record = verify_otp(db, payload.email, payload.otp)

    # Jika akun dengan email tersebut sudah ada di tabel users, aktifkan is_verified
    user = get_user_by_email(db, payload.email)
    if user:
        user.is_verified = True
        db.commit()

    return {
        "success": True,
        "email": payload.email.strip().lower(),
        "verified": True,
        "message": "Email berhasil diverifikasi.",
    }


@router.post(
    "/otp/resend",
    summary="Mengirim ulang kode OTP dengan proteksi rate limit cooldown",
)
def resend_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    """Meminta pengiriman ulang kode OTP jika jeda cooldown 60 detik terpenuhi."""
    result = request_otp(db, payload.email)
    return result
