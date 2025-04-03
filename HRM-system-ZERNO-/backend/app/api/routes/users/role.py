from fastapi import APIRouter, Depends

from service.public.role import RoleService

from schema.users.role import RoleResponse
from api.dependencies import get_role_service

from typing import Annotated

CommonRoleService = Annotated[
    RoleService,
    Depends(get_role_service)
]

router = APIRouter()


@router.get(
    "/get_all",
    response_model=list[RoleResponse],
    summary="Get all roles",
    description="Get all roles with pagination",
)
async def get_all_roles(
    role_service: CommonRoleService = CommonRoleService
) -> dict:
    roles = await role_service.get_all_roles()
    return roles
