from datetime import UTC, datetime, timedelta

from cryptography.fernet import Fernet
from jose import jwt

from app.config import get_settings

ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=60 * 24 * 7)  # 1 week by default

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        decoded = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return decoded
    except jwt.JWTError:
        return None


def encrypt_token(token: str) -> str:
    settings = get_settings()
    fernet = Fernet(settings.token_encryption_key.encode())
    return fernet.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    settings = get_settings()
    fernet = Fernet(settings.token_encryption_key.encode())
    return fernet.decrypt(encrypted_token.encode()).decode()
