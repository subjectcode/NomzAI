import re
from pydantic import BaseModel, EmailStr, Field, field_validator

USERNAME_REGEX = re.compile(r"^[a-z0-9_]{4,20}$")


class UserCreate(BaseModel):
    """Schema untuk registrasi pengguna baru dengan email dan password."""

    email: EmailStr
    username: str | None = Field(
        None,
        min_length=4,
        max_length=20,
        description="Username unik akun (4-20 karakter, huruf, angka, underscore)",
    )
    display_name: str = Field(
        ..., min_length=1, max_length=100, description="Nama lengkap pengguna"
    )
    password: str = Field(
        ..., min_length=8, max_length=128, description="Password minimal 8 karakter"
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip().lower()
        if not cleaned:
            raise ValueError("Username tidak boleh kosong.")
        if len(cleaned) < 4:
            raise ValueError("Username minimal 4 karakter.")
        if len(cleaned) > 20:
            raise ValueError("Username maksimal 20 karakter.")
        if not USERNAME_REGEX.match(cleaned):
            raise ValueError("Username hanya boleh berisi huruf, angka, dan underscore.")
        return cleaned

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Nama lengkap tidak boleh kosong.")
        return trimmed

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter.")
        if not v.strip():
            raise ValueError("Password tidak boleh hanya berisi spasi.")
        return v


class UserLogin(BaseModel):
    """Schema untuk login pengguna dengan email dan password."""

    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema untuk memperbarui profil pengguna."""

    display_name: str | None = Field(
        None, min_length=1, max_length=100, description="Nama tampilan baru"
    )
    username: str | None = Field(
        None, min_length=4, max_length=20, description="Username baru"
    )
    avatar_url: str | None = Field(
        None, description="URL atau identifier avatar pengguna"
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip().lower()
        if not cleaned:
            raise ValueError("Username tidak boleh kosong.")
        if len(cleaned) < 4:
            raise ValueError("Username minimal 4 karakter.")
        if len(cleaned) > 20:
            raise ValueError("Username maksimal 20 karakter.")
        if not USERNAME_REGEX.match(cleaned):
            raise ValueError("Username hanya boleh berisi huruf, angka, dan underscore.")
        return cleaned


class GoogleAuthRequest(BaseModel):
    """Schema untuk autentikasi via Google id_token dari expo-auth-session."""

    id_token: str = Field(
        ..., description="Google id_token yang diperoleh dari expo-auth-session"
    )


class UserPublic(BaseModel):
    """Data pengguna yang aman ditampilkan ke klien (tanpa password hash)."""

    id: str
    email: str
    username: str | None = None
    display_name: str
    avatar_url: str | None = None
    auth_provider: str
    is_verified: bool = True

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Schema respons autentikasi berisi access token dan data pengguna publik."""

    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class OTPRequest(BaseModel):
    """Schema permintaan pengiriman atau kirim ulang kode OTP."""

    email: EmailStr


class OTPVerifyRequest(BaseModel):
    """Schema verifikasi kode OTP."""

    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, description="Kode OTP 6 digit")


# Resolve forward reference
AuthResponse.model_rebuild()
