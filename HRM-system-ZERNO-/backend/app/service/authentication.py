from fastapi import HTTPException
from .users.user import UserService
from sqlalchemy.ext.asyncio import AsyncSession

from .utils.utils import create_access_token, verify_password, jwt_decode
from model import User
from schema.authentication import TokenCreate, TokenResponse
from service.users.role import RoleService
from schema.users.user import UserResponse 


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
            
            if (await self.role_service.get_role_by_id(user.role_id)).role != "admin":
                raise HTTPException(status_code=403, detail="User is not an admin")
            return user
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
            
    