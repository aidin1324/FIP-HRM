from repository.base import BaseRepository
from sqlalchemy.future import select
from model import User


class UserRepository(BaseRepository):
    async def get_all_users(self):
        result = await self.connection.execute(select(User))
        users = result.scalars().all()
        return users
    
    async def get_user_by_id(self, user_id: int):
        result = await self.connection.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        return user
    
    async def get_user_by_email(self, email: str):
        result = await self.connection.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        return user
    
    async def create_user(self, user_create):
        user = User(**user_create.model_dump())
        self.connection.add(user)
        await self.connection.flush()
        await self.connection.refresh(user)
        return user
        
    async def update_user(self, user, user_update):
        update_fields = user_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(user, field, value)
        
        self.connection.add(user)
        await self.connection.flush()
        await self.connection.refresh(user)
        return user
    
    async def delete_user(self, user):
        await self.connection.delete(user)
        await self.connection.flush()
        return {"detail": "User deleted"}