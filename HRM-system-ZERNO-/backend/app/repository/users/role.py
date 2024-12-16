from repository.base import BaseRepository
from sqlalchemy.future import select
from model import Role

class RoleRepositroy(BaseRepository):
    async def get_all_roles(self):
        result = await self.connection.execute(select(Role))
        roles = result.scalars().all()
        return roles
    
    async def get_role_by_id(self, role_id: int):
        result = await self.connection.execute(select(Role).filter(Role.id == role_id))
        role = result.scalars().first()
        return role
    
    async def create_role(self, role_create):
        role = Role(**role_create.model_dump())
        self.connection.add(role)
        await self.connection.flush()
        await self.connection.refresh(role)
        return role
    
    async def update_role(self, role, role_update):
        update_fields = role_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(role, field, value)
        
        self.connection.add(role)
        await self.connection.flush()
        await self.connection.refresh(role)
        return role
    
    async def delete_role(self, role):
        await self.connection.delete(role)
        await self.connection.flush()
        return {"detail": "Role deleted"}