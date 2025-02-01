from sqlalchemy import desc
from repository.base import BaseRepository
from sqlalchemy.future import select
from model import User

from sqlalchemy.orm import joinedload


class UserRepository(BaseRepository):
    async def get_users_pagination_with_sort(
        self,
        limit: int, 
        cursor: int,
        role_id: int = None,
        sort_by: str = "id",
        ascending: bool = True,
        active: bool | None = None
    ):
        sort_column = getattr(User, sort_by, None)

        if sort_column is None:
            raise ValueError(f"Неверное поле для сортировки: {sort_by}")
        
        query = select(User).limit(limit).options(joinedload(User.role))
        filters = []
        if cursor:
            filters.append(User.id > cursor)
        if role_id is not None:
            filters.append(User.role_id == role_id)
        if active:
            filters.append(User.active == active)
            
        # Применяем фильтры к запросу
        if filters:
            query = query.where(*filters)
        
        if ascending:
            query = query.order_by(sort_column)
        else:
            query = query.order_by(desc(sort_column))
        
        result = await self.connection.execute(query)
        users = result.scalars().all()
        return users
    
    async def get_user_by_id(self, user_id: int) -> User | None:
        result = await self.connection.execute(
            select(User)
            .options(joinedload(User.role))
            .filter(User.id == user_id)
        )
        user = result.scalars().first()
        return user
    
    async def get_user_by_email(self, email: str):
        result = await self.connection.execute(
            select(User)
            .options(joinedload(User.role))
            .filter(User.email == email)
        )
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