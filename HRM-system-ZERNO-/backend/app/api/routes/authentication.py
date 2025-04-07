from app.api.dependencies import get_authentication_service
from app.db.db import get_db

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.schema.users.user import UserResponse
from app.schema.authentication import TokenResponse, TokenCreate
from app.service.authentication import AuthenticationService

from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.schema.users.reset_password import PasswordResetConfirm, PasswordResetRequest

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login") 

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login",
    description="Login with email and password",
)
async def login(
    # request: TokenCreate, кастомная модель
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_db)
) -> dict:
    auth_service = get_authentication_service(session)
    
    # token = await auth_service.login(request) кастомная модель
    request = TokenCreate(email=form_data.username, password=form_data.password)
    token = await auth_service.login(request)
    return token


@router.post(
    "/get_current_admin",
    response_model=UserResponse,
    summary="Check admin permission and return admin id",
    description="Check if the user is an admin",
)
async def check_admin_permission(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
) -> dict:
    auth_service = get_authentication_service(session)
    
    user = await auth_service.get_current_admin(token)
    return user

@router.post(
    "/get_current_user",
    response_model=UserResponse,
    summary="Get current user",
    description="Get current user by token",
)
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db)
) -> dict:
    auth_service = get_authentication_service(session)
    
    user = await auth_service.get_current_user(token)
    return user



@router.post(
    "/forgot-password",
    summary="Request password reset",
    description="Send password reset link to user's email",
)
async def forgot_password(
    request: PasswordResetRequest,
    session: AsyncSession = Depends(get_db)
) -> dict:
    auth_service = get_authentication_service(session)
    return await auth_service.generate_password_reset_token(request)


@router.post(
    "/reset-password",
    summary="Reset password with token",
    description="Reset user password using the token from email",
)
async def reset_password(
    request: PasswordResetConfirm,
    session: AsyncSession = Depends(get_db)
) -> dict:
    auth_service = get_authentication_service(session)
    return await auth_service.reset_password(request)