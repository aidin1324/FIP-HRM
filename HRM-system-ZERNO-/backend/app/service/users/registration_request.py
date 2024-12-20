from fastapi import HTTPException
from repository.users.registration_request import RegistrationRequestRepository

from sqlalchemy.ext.asyncio import AsyncSession

from schema.users.user import UserCreate
from schema.users.registration_request import RegistrationRequestCreate, RegistrationRequestResponse, RegistrationRequestUpdate
from passlib.context import CryptContext

from .user import UserService

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegistrationRequest:
    def __init__(
        self,
        session: AsyncSession, 
        registration_request_repo: RegistrationRequestRepository,
        user_service: UserService
    ):
        self.session = session
        self.registration_request_repo = registration_request_repo
        self.user_service = user_service

    async def get_registration_requests_by_cursor(self) -> list[RegistrationRequestResponse]:
        """
        get all registration requests with pagination
        """
        try:
            registration_requests = await self.registration_request_repo.get_all_registration_requests()
            return registration_requests
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def get_registration_request_by_id(self, registration_request_id: int):
        """
        get a registration request by id
        """
        pass
    
    async def create_registration_request(
        self,
        registration_request_create: RegistrationRequestCreate
        ) -> RegistrationRequestResponse:
        """
        create a registration request
        """
        try:
            hashed_password = pwd_context.hash(registration_request_create.hashed_password)
            registration_request_create.hashed_password = hashed_password
            
            async with self.session.begin():
                registration_request = await self.registration_request_repo.create_registration_request(registration_request_create)
            # return registration_request if needed
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    async def update_registration_request(
        self,
        registration_request_id: int,
        registration_request_update: RegistrationRequestUpdate
        ) -> RegistrationRequestResponse:
        """
        update a registration request
        """
        try:
            async with self.session.begin():
                registration_request = await self.registration_request_repo.get_registration_request_by_id(registration_request_id)
                registration_request = await self.registration_request_repo.update_registration_request(registration_request, registration_request_update)
                
                if registration_request_update.status == 'approved':
                    user_create = UserCreate(
                        first_name=registration_request.first_name,
                        second_name=registration_request.second_name,
                        email=registration_request.email,
                        hashed_password=registration_request.hashed_password,
                        role_id=registration_request.role_id
                    )
                    await self.user_service.register_user(user_create, nested=True)
                    
                if registration_request_update.status == 'rejected':
                    # send email to user or e.t.c
                    pass
                    
            # return registration_request if needed
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def delete_registration_request(self, registration_request_id: int):
        """
        delete a registration request
        """
        try:
            async with self.session.begin():
                registration_request = await self.registration_request_repo.get_registration_request_by_id(registration_request_id)
                await self.registration_request_repo.delete_registration_request(registration_request)
            # return registration_request if needed
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    