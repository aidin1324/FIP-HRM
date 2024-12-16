from fastapi import HTTPException
from .users import UserService
from sqlalchemy.ext.asyncio import AsyncSession

from utils.utils import create_access_token, verify_password, jwt_decode
from model import User


class AuthenticationService:
    
    def __init__(self, session: AsyncSession, user_service: UserService):
        self.session = session
        self.user_service = user_service
        
    async def login(self, email: str, password: str) -> str:
        """
        log into the system with email and password
        generate a jwt access token and return it

        Args:
            email (str)
            password (str)
        """
        try:
            user: User = await self.user_service.get_user_by_email(email)
            
            if not verify_password(password, user.hashed_password):
                raise HTTPException(status_code=400, detail="Incorrect password")
            
            if user.status == "pending":
                raise HTTPException(status_code=400, detail="User is not verified by the admin")
            
            token = create_access_token(
                {
                    "sub": user.email,
                    "role": user.role
                }
            )
            
            return token
        except Exception as e:
            raise HTTPException(status_code=400, detail=str)
    
    async def get_current_user(self, token: str):
        """
        get the current user from the token

        Args:
            token (str)
        """
        try:
            payload = jwt_decode(token)
            email: str = payload.get("sub")
            user = await self.user_service.get_user_by_email(email)
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def get_current_admin(self, token: str):
        """
        get the current admin from the token

        Args:
            token (str)
        """
        try:
            payload = jwt_decode(token)
            email: str = payload.get("sub")
            user = await self.user_service.get_user_by_email(email)
            if user.role != "admin":
                raise HTTPException(status_code=400, detail="User is not an admin")
            
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def get_user_role(self, token: str):
        """
        get the role of the user

        Args:
            token (str)
        """
        try:
            payload = jwt_decode(token)
            role = payload.get("role")
            return role
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
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
            
    