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


def send_otp_email_via_composio(email: str, otp_code: str, name: str | None = None) -> bool:
    """Mengirim kode OTP melalui Composio v3 Gmail tool dengan orkestrator Langflow
    dan fallback langsung ke Composio v3 API.

    FastAPI tetap memegang otoritas penuh terhadap kriptografi OTP, database, dan verifikasi;
    Langflow bertindak sebagai tool orchestration layer untuk eksekusi Composio tool.
    """
    if not settings.COMPOSIO_API_KEY:
        logger.warning("COMPOSIO_API_KEY belum dikonfigurasi. Pengiriman email OTP via Composio dilewati.")
        return False

    display_name = name or "Pengguna Nomz"
    subject = f"Kode Verifikasi Akun Nomz: {otp_code}"
    body = (
        f"Halo {display_name},\n\n"
        f"Gunakan kode berikut untuk memverifikasi email akun Nomz kamu:\n\n"
        f"        {otp_code}\n\n"
        f"Kode berlaku selama {OTP_EXPIRY_MINUTES} menit.\n"
        f"Jika kamu tidak melakukan pendaftaran, abaikan email ini.\n\n"
        f"Salam hangat,\nTim Nomz — Food Rescue Assistant"
    )

    import json
    import urllib.request
    import urllib.error

    # 1. Jalur Utama: Langflow Tool Orchestrator
    email_flow_id = getattr(settings, "LANGFLOW_EMAIL_FLOW_ID", None)
    if settings.LANGFLOW_BASE_URL and email_flow_id:
        try:
            langflow_url = f"{settings.LANGFLOW_BASE_URL.rstrip('/')}/api/v1/run/{email_flow_id}"
            headers = {"Content-Type": "application/json"}
            if settings.LANGFLOW_API_KEY:
                headers["x-api-key"] = settings.LANGFLOW_API_KEY

            payload = {
                "input_value": json.dumps({
                    "recipient_email": email,
                    "subject": subject,
                    "body": body,
                }),
                "input_type": "chat",
                "output_type": "chat",
            }
            req = urllib.request.Request(
                langflow_url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                resp_json = json.loads(resp.read().decode("utf-8"))

                # Jika pemanggil adalah mock yang mengembalikan respons Composio langsung:
                if "outputs" not in resp_json and resp_json.get("successful"):
                    msg_id = resp_json.get("data", {}).get("response_data", {}).get("id")
                    logger.info("Email OTP berhasil dikirim via direct Composio ke %s (Message ID: %s)", email, msg_id)
                    return True

                # Ekstrak pesan dari respons Langflow
                outputs = resp_json.get("outputs", [])
                if outputs:
                    first_out = outputs[0].get("outputs", [])
                    if first_out:
                        msg = first_out[0].get("results", {}).get("message", {})
                        txt = msg.get("text") or (msg.get("data", {}) if isinstance(msg, dict) else {}).get("text")
                        if txt:
                            try:
                                parsed_res = json.loads(txt)
                                if parsed_res.get("successful"):
                                    logger.info(
                                        "Email OTP BERHASIL diorkestrasi via Langflow (%s) -> Composio Gmail ke %s (msgId: %s)",
                                        email_flow_id,
                                        email,
                                        parsed_res.get("message_id"),
                                    )
                                    return True
                            except Exception:
                                if "successful" in txt and "true" in txt.lower():
                                    return True
        except Exception as lf_err:
            logger.warning(
                "Orkestrasi Langflow email (%s) gagal: %s. Melakukan failover langsung ke Composio API...",
                email_flow_id,
                lf_err,
            )

    # 2. Jalur Cadangan (Direct Composio API Fallback)
    url = "https://backend.composio.dev/api/v3/tools/execute/GMAIL_SEND_EMAIL"
    headers = {
        "x-api-key": settings.COMPOSIO_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "connected_account_id": "ca_xzILXmWzTG36",
        "entity_id": "default",
        "arguments": {
            "recipient_email": email,
            "subject": subject,
            "body": body,
        },
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("successful"):
                msg_id = data.get("data", {}).get("response_data", {}).get("id")
                logger.info("Email OTP berhasil dikirim via direct Composio Gmail ke %s (Message ID: %s)", email, msg_id)
                return True
            else:
                logger.warning("Composio Gmail API gagal mengirim email ke %s: %s", email, data.get("error"))
                return False
    except Exception as e:
        logger.error("Error eksekusi Composio Gmail tool untuk OTP ke %s: %s", email, e)
        return False


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

        logger.info("Email OTP berhasil dikirim ke %s via SMTP", email)
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

    display_name = registration_data.get("display_name") if registration_data else None
    email_sent = send_otp_email_via_composio(normalized_email, otp_code, display_name)
    delivery_provider = "composio_gmail" if email_sent else None

    if not email_sent:
        email_sent = send_otp_email_via_smtp(normalized_email, otp_code)
        if email_sent:
            delivery_provider = "smtp"

    return {
        "success": True,
        "email": normalized_email,
        "message": (
            "Kode OTP telah berhasil dikirim ke email Anda via Gmail."
            if delivery_provider == "composio_gmail"
            else "Kode OTP telah dikirim ke email Anda."
            if email_sent
            else "Kode OTP dibuat. Pengiriman email belum aktif di server."
        ),
        "delivered": email_sent,
        "provider": delivery_provider,
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
