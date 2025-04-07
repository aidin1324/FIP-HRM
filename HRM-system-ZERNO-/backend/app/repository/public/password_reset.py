from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.model.public.password_reset import PasswordReset
from datetime import datetime


class PasswordResetRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def create_reset_token(self, user_id: int, token: str, expires_at: datetime) -> PasswordReset:
        # Удалить существующие токены для пользователя
        await self.delete_tokens_for_user(user_id)
        
        # Создать новый токен
        reset_token = PasswordReset(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        self.session.add(reset_token)
        await self.session.commit()
        return reset_token
    
    async def get_reset_token(self, token: str) -> PasswordReset:
        query = select(PasswordReset).where(PasswordReset.token == token)
        result = await self.session.execute(query)
        return result.scalars().first()
    
    async def delete_expired_tokens(self):
        query = delete(PasswordReset).where(PasswordReset.expires_at < datetime.utcnow())
        await self.session.execute(query)
        await self.session.commit()
    
    async def delete_tokens_for_user(self, user_id: int):
        query = delete(PasswordReset).where(PasswordReset.user_id == user_id)
        await self.session.execute(query)
        await self.session.commit()
    
    async def delete_token(self, token: str):
        query = delete(PasswordReset).where(PasswordReset.token == token)
        await self.session.execute(query)
        await self.session.commit()