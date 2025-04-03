from api.dependencies import get_user_service, get_role_service

from fastapi import APIRouter, Depends

from schema.users.user import UserResponse, UserUpdate, UserCreate
from service.public.user import UserService
from service.public.role import RoleService

from sqlalchemy.ext.asyncio import AsyncSession
from db.db import get_db

router = APIRouter()


@router.get(
    "/get_user_with_pagination",
    response_model=list[UserResponse],
    summary="Get all users with pagination and sort options",
    description="Get all users with pagination and sort options",
)   
async def get_user_with_pagination(
    session: AsyncSession = Depends(get_db),
    limit: int = 5,
    cursor: int = 0,
    role: str = None,
    sort_by: str = "id",
    ascending: bool = True,
    active: bool | None = None
) -> dict:
    user_service: UserService = get_user_service(session)
    filter = {
        "sort_by": sort_by,
        "ascending": ascending,
        "active": active
    }
    
    if role:
        role_service: RoleService = get_role_service(session)
        role_id: int = await role_service.get_role_id_by_name(role)
        filter |= {"role_id": role_id}
    
    users = await user_service.get_users_by_cursor_with_sort(
        limit=limit, 
        cursor=cursor,
        **filter
    )
    return users


@router.get(
    "/get_user/{user_id}",
    response_model=UserResponse,
    summary="Get a user profile by id",
    description="Get a user information by id, spicifically email, role, and active status, name, surname e.t.c",
)
async def get_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
) -> dict:
    user = await user_service.get_user_by_id(user_id)
    return user


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


@router.patch(
    "/update_user/{user_id}",
    response_model=UserResponse,
    summary="Update a user",
    description="Update a user by id",
)
async def update_user(
    user_id: int,
    request: UserUpdate,
    user_service: UserService = Depends(get_user_service)
) -> dict:
    updated_user = await user_service.update_user(user_id, request)
    return updated_user
