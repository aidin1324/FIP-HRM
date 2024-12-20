from typing import Annotated
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from config import secret_key, algorithm, access_token_expire_minutes
from jose import ExpiredSignatureError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def jwt_decode(token: str):
    try:
        jwt_data = jwt.decode(token, secret_key, algorithms=[algorithm])
        return jwt_data
    except ExpiredSignatureError:
        raise Exception("Token expired")
    