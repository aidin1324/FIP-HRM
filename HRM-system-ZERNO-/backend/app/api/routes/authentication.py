from api.dependencies import get_authentication_service
from db.db import get_db

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from schema.users.user import UserResponse
from schema.authentication import TokenResponse, TokenCreate
from service.authentication import AuthenticationService

from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

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
