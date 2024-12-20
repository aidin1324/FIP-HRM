from fastapi import HTTPException
from schema.users.user import UserCreate, UserUpdate, UserResponse
from passlib.context import CryptContext
from repository.users.user import UserRepository
from sqlalchemy.ext.asyncio import AsyncSession

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
 
 
class UserService:
    def __init__(self, session: AsyncSession, user_repo: UserRepository):
        self.session = session
        self.user_repo = user_repo
        
    async def register_user(
        self, 
        user_create: UserCreate,
        hash=False,
        nested=False
    ):
        """
        send request to register a user
        default status is pending 

        Args:
            user_create (UserCreate)
        """
        try:
            if hash:
                hashed_password = pwd_context.hash(user_create.hashed_password)
                user_create.hashed_password = hashed_password
            
            if nested:
                user = await self.user_repo.create_user(user_create) # flush
                # return user if needed
            else:
                async with self.session.begin():
                    user = await self.user_repo.create_user(user_create)
                # return user if needed 
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def get_users_by_cursor(self) -> list[UserResponse]:
        """
        get all users
        
        soon will be released with pagination!!!
        """
        try:
            users = await self.user_repo.get_all_users()
            return users
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def get_user_by_id(self, user_id: int) -> UserResponse:
        """
        get a user by id
        
        Args:
            user_id (int)
        """
        try:
            user = await self.user_repo.get_user_by_id(user_id)
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def get_user_by_email(self, email: str) -> UserResponse:
        """
        get a user by email
        
        Args:
            email (str)
        """
        try:
            user = await self.user_repo.get_user_by_email(email)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def update_user(self, user_id: int, user_update) -> UserResponse:
        """
        update a user
        
        Args:
            user_id (int)
            user_update (UserUpdate)
        """
        try:
            async with self.session.begin():
                user = await self.user_repo.get_user_by_id(user_id)
                user = await self.user_repo.update_user(user, user_update)
                return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str)
    
    async def delete_user(self, user_id: int) -> dict:
        """
        delete a user
        
        Args:
            user_id (int)
        """
        try:
            async with self.session.begin():
                user = await self.user_repo.get_user_by_id(user_id)
                await self.user_repo.delete_user(user)
                return {"detail": "User deleted"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e)) 
    