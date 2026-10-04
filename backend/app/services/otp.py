"""Layanan verifikasi OTP Nomz untuk pendaftaran email."""

import hashlib
import logging
import secrets
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import EmailVerificationToken

logger = logging.getLogger(__name__)

OTP_EXPIRY_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


def generate_otp_code() -> str:
    """Menghasilkan kode OTP 6 digit acak secara kriptografis."""
    return "".join(str(secrets.randbelow(10)) for _ in range(6))


def hash_otp_code(otp: str, email: str) -> str:
    """Meng-hash kode OTP dengan salt unik email."""
    salt = f"{settings.JWT_SECRET_KEY}:{email.strip().lower()}"
    return hashlib.sha256(f"{salt}:{otp}".encode("utf-8")).hexdigest()


def send_otp_email_via_smtp(email: str, otp_code: str) -> bool:
    """Mengirim kode OTP melalui protokol SMTP jika server SMTP dikonfigurasi.

    Jika SMTP tidak dikonfigurasi, mencatat peringatan dan mengembalikan False.
    """
    if not settings.SMTP_HOST:
        logger.warning(
            "SMTP_HOST belum dikonfigurasi. Pengiriman email OTP ke %s ditangguhkan.",
            email,
        )
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"{otp_code} adalah Kode Verifikasi Akun Nomz Anda"
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = email

        text_content = (
            f"Halo!\n\n"
            f"Kode verifikasi akun Nomz Anda adalah: {otp_code}\n\n"
            f"Kode ini berlaku selama {OTP_EXPIRY_MINUTES} menit. "
            f"Jangan berikan kode ini kepada siapapun demi keamanan akun Anda.\n\n"
            f"Salam,\nTim Nomz"
        )
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #059669; margin-top: 0;">Nomz — Food Rescue Assistant</h2>
            <p>Halo,</p>
            <p>Gunakan kode verifikasi berikut untuk menyelesaikan pendaftaran akun Nomz Anda:</p>
            <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827; margin: 20px 0;">
                {otp_code}
            </div>
            <p style="font-size: 13px; color: #6b7280;">Kode ini hanya berlaku selama {OTP_EXPIRY_MINUTES} menit. Jangan berikan kode ini kepada orang lain.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">Email ini dikirim otomatis oleh Nomz App. Jika Anda tidak merasa mendaftar, abaikan pesan ini.</p>
        </div>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, [email], msg.as_string())

        logger.info("Email OTP berhasil dikirim ke %s", email)
        return True
    except Exception as e:
        logger.error("Gagal mengirim email OTP ke %s via SMTP: %s", email, e)
        return False


def request_otp(db: Session, email: str, registration_data: dict | None = None) -> dict:
    """Membuat atau memperbarui token OTP untuk email tertentu dengan perlindungan cooldown."""
    normalized_email = email.strip().lower()
    now = datetime.utcnow()

    # Periksa token aktif terakhir
    last_token = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.email == normalized_email,
            EmailVerificationToken.is_used == False,
        )
        .order_by(EmailVerificationToken.created_at.desc())
        .first()
    )

    if last_token and last_token.resend_available_at > now:
        cooldown_left = int((last_token.resend_available_at - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Harap tunggu {cooldown_left} detik sebelum meminta kode baru.",
        )

    # Invalidate token lama yang belum digunakan
    if last_token:
        last_token.is_used = True

    otp_code = generate_otp_code()
    otp_hash = hash_otp_code(otp_code, normalized_email)

    import json

    token_record = EmailVerificationToken(
        email=normalized_email,
        otp_hash=otp_hash,
        registration_data=json.dumps(registration_data) if registration_data else None,
        expires_at=now + timedelta(minutes=OTP_EXPIRY_MINUTES),
        resend_available_at=now + timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS),
        attempts=0,
        max_attempts=OTP_MAX_ATTEMPTS,
        is_used=False,
    )
    db.add(token_record)
    db.commit()

    email_sent = send_otp_email_via_smtp(normalized_email, otp_code)

    return {
        "success": True,
        "email": normalized_email,
        "message": (
            "Kode OTP telah dikirim ke email Anda."
            if email_sent
            else "Kode OTP dibuat. (SMTP eksternal belum dikonfigurasi di server)."
        ),
        "smtp_delivered": email_sent,
        "expires_in_seconds": OTP_EXPIRY_MINUTES * 60,
    }


def verify_otp(db: Session, email: str, otp_code: str) -> EmailVerificationToken:
    """Memverifikasi kode OTP terhadap rekaman database aktif."""
    normalized_email = email.strip().lower()
    clean_otp = otp_code.strip()
    now = datetime.utcnow()

    token_record = (
        db.query(EmailVerificationToken)
        .filter(
            EmailVerificationToken.email == normalized_email,
            EmailVerificationToken.is_used == False,
        )
        .order_by(EmailVerificationToken.created_at.desc())
        .first()
    )

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kode OTP tidak ditemukan atau sudah digunakan.",
        )

    if token_record.expires_at < now:
        token_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kode OTP sudah kedaluwarsa.",
        )

    if token_record.attempts >= token_record.max_attempts:
        token_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Batas percobaan OTP telah terlampaui. Silakan minta kode baru.",
        )

    # Verifikasi hash
    expected_hash = hash_otp_code(clean_otp, normalized_email)
    if token_record.otp_hash != expected_hash:
        token_record.attempts += 1
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kode OTP salah.",
        )

    # Berhasil: tandai OTP telah digunakan
    token_record.is_used = True
    db.commit()
    logger.info("OTP untuk email %s berhasil diverifikasi", normalized_email)
    return token_record
