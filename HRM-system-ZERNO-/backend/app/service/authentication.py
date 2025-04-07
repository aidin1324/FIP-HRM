from datetime import datetime, timedelta
import secrets
import string
from fastapi import HTTPException

from app.repository.public.password_reset import PasswordResetRepository
from app.schema.users.reset_password import PasswordResetConfirm, PasswordResetRequest
from app.service.public.password_reset import EmailService
from .public.user import UserService
from sqlalchemy.ext.asyncio import AsyncSession

from .utils.utils import create_access_token, verify_password, jwt_decode, pwd_context
from app.model import User
from app.schema.authentication import TokenResponse
from app.service.public.role import RoleService
from app.schema.users.user import UserResponse 


class AuthenticationService:
    
    def __init__(
        self, 
        session: AsyncSession, 
        user_service: UserService,
        role_service: RoleService
    ):
        self.session = session
        self.user_service = user_service
        self.role_service = role_service
        
    async def login(self, TokenCreate) -> TokenResponse:
        """
        log into the system with email and password
        generate a jwt access token and return it

        Args:
            email (str)
            password (str)
        """
        try:
            user: User = await self.user_service.get_user_by_email(TokenCreate.email)
            
            if not verify_password(TokenCreate.password, user.hashed_password):
                raise HTTPException(status_code=400, detail="Incorrect password")

            token = create_access_token(
                {
                    "id": user.id,
                    "role": (await self.role_service.get_role_by_id(user.role_id)).role
                }
            )
            
            return TokenResponse(access_token=token)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def get_current_user(self, token: str) -> UserResponse:
        try:
            payload = jwt_decode(token)
            user_id: int = payload.get("id")
            if not user_id:
                raise HTTPException(status_code=400, detail="Missing user_id in token payload")
            user = await self.user_service.get_user_by_id(user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_current_admin(self, token: str) -> UserResponse:
        try:
            payload = jwt_decode(token)

            user_id: int = payload.get("id")
            if not user_id:
                raise HTTPException(status_code=400, detail="Missing user_id in token payload")
            user = await self.user_service.get_user_by_id(user_id)

            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            if (await self.role_service.get_role_by_id(user.role_id)).role != "админ":
                raise HTTPException(status_code=403, detail="User is not an admin")
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    
    async def generate_password_reset_token(self, request: PasswordResetRequest):
        """
        Generate a password reset token and send email
        
        Args:
            request (PasswordResetRequest): Email for password reset
        """
        try:
            user = await self.user_service.get_user_by_email(request.email)
            if not user:
                # Для безопасности не сообщаем что пользователь не найден
                return {"message": "Если email зарегистрирован, инструкции по сбросу пароля отправлены"}
            
            # Генерация токена
            alphabet = string.ascii_letters + string.digits
            token = ''.join(secrets.choice(alphabet) for _ in range(64))
            
            # Срок действия токена - 1 час
            expires_at = datetime.utcnow() + timedelta(hours=1)
            
            # Создаем репозиторий для работы с токенами сброса пароля
            reset_repo = PasswordResetRepository(self.session)
            
            # Сохраняем токен в базе данных
            await reset_repo.create_reset_token(user.id, token, expires_at)
            
            # Отправляем email
            await EmailService.send_password_reset_email(
                user.email, 
                token, 
                f"{user.first_name} {user.second_name}"
            )
            
            return {"message": "Если email зарегистрирован, инструкции по сбросу пароля отправлены"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def reset_password(self, request: PasswordResetConfirm):
        """
        Reset password using token
        
        Args:
            request (PasswordResetConfirm): Token and new password
        """
        try:
            reset_repo = PasswordResetRepository(self.session)
            
            # Получаем токен из базы данных
            reset_token = await reset_repo.get_reset_token(request.token)
            
            if not reset_token:
                raise HTTPException(status_code=400, detail="Недействительный токен сброса пароля")
            
            if reset_token.expires_at < datetime.utcnow():
                # Удаляем просроченный токен
                await reset_repo.delete_token(request.token)
                raise HTTPException(status_code=400, detail="Срок действия токена истек")
            
            # Получаем пользователя
            user = await self.user_service.get_user_by_id(reset_token.user_id)
            
            # Хешируем новый пароль
            hashed_password = pwd_context.hash(request.new_password)
            
            # Обновляем пароль
            await self.user_service.update_password(user.id, hashed_password)
            
            # Удаляем использованный токен
            await reset_repo.delete_token(request.token)
            
            return {"message": "Ваш пароль успешно обновлен"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def get_user_role(self, token: str):
        """
        get the role of the user

        Args:
            token (str)
        """
        pass
    
    async def refresh_token(self, token: str):
        """
        refresh the token
        will be soon released!!!
        
        Args:
            token (str)
        """
        pass 
    
    async def logout(self, token: str):
        """
        log out from the system
        
        Args:
            token (str)
        """
        pass
            
    