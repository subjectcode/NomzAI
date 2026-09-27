from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema untuk registrasi pengguna baru dengan email dan password."""

    email: EmailStr
    display_name: str = Field(
        ..., min_length=1, max_length=100, description="Nama tampilan pengguna"
    )
    password: str = Field(
        ..., min_length=8, max_length=128, description="Password minimal 8 karakter"
    )


class UserLogin(BaseModel):
    """Schema untuk login pengguna dengan email dan password."""

    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    """Schema untuk autentikasi via Google id_token dari expo-auth-session."""

    id_token: str = Field(
        ..., description="Google id_token yang diperoleh dari expo-auth-session"
    )


class AuthResponse(BaseModel):
    """Schema respons autentikasi berisi access token dan data pengguna publik."""

    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class UserPublic(BaseModel):
    """Data pengguna yang aman ditampilkan ke klien (tanpa password hash)."""

    id: str
    email: str
    display_name: str
    avatar_url: str | None = None
    auth_provider: str

    model_config = {"from_attributes": True}


# Resolve forward reference
AuthResponse.model_rebuild()
