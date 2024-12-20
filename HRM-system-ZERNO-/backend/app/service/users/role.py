from repository.users.role import RoleRepositroy

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from schema.users.role import RoleResponse


class RoleService:
    def __init__(
        self,
        session: AsyncSession,
        role_repo: RoleRepositroy
    ):
        self.session = session
        self.role_repo = role_repo
        
    async def get_all_roles(self) -> list[RoleResponse]:
        """
        get all roles
        """
        try:
            roles = await self.role_repo.get_all_roles()
            return roles
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def get_role_by_id(self, role_id: int) -> RoleResponse:
        """
        get a role by id
        """
        try:
            role = await self.role_repo.get_role_by_id(role_id)
            return role
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))