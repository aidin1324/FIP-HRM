from api.dependencies import get_user_service

from fastapi import APIRouter, Depends, HTTPException

from schema.users.user import UserResponse, UserUpdate, UserCreate
from service.users.user import UserService

router = APIRouter()


@router.get(
    "/get_all",
    response_model=list[UserResponse],
    summary="Get all users",
    description="Get all users with pagination",
)
async def get_all_users(
    user_service: UserService = Depends(get_user_service)
) -> dict:
    users = await user_service.get_users_by_cursor()
    return users


@router.post(
    "/create_user",
    response_model=dict,
    summary="Create a user",
    description="Create a user with email, password, and role strait without registration request",
)
async def create_user(
    request: UserCreate,
    user_service: UserService = Depends(get_user_service)
) -> dict:
    await user_service.register_user(request, hash=True)
    return {"status": "User created successfully"}