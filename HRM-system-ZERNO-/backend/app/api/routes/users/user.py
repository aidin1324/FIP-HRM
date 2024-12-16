from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from service.users.user import UserService

from dependencies import get_user_service

from typing import Annotated


router = APIRouter()


CommonUserService = Annotated[
    UserService,
    Depends(get_user_service)
]


@router.post(
    "/register",
    response_model=dict,
    summary="Send user registration request",
    description="Send user registration request to the admin, filling in the user's email, password, and role",
)
async def register_user(
    user_create: OAuth2PasswordRequestForm,
    user_service: CommonUserService = CommonUserService
) -> dict:
    await user_service.register_user(user_create)
    return {"status": "User registered successfully"}