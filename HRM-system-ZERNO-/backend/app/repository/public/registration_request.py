from repository.base import BaseRepository
from sqlalchemy.future import select
from model import RegistrationRequest


class RegistrationRequestRepository(BaseRepository):
    async def   get_all_registration_requests(self):
        result = await self.connection.execute(select(RegistrationRequest))
        registration_requests = result.scalars().all()
        return registration_requests
    
    async def get_registration_request_by_id(self, registration_request_id: int):
        result = await self.connection.execute(select(RegistrationRequest).filter(RegistrationRequest.id == registration_request_id))
        registration_request = result.scalars().first()
        return registration_request
    
    async def create_registration_request(self, registration_request_create):
        registration_request = RegistrationRequest(**registration_request_create.model_dump())
        self.connection.add(registration_request)
        await self.connection.flush()
        await self.connection.refresh(registration_request)
        return registration_request
        
    async def update_registration_request(self, registration_request, registration_request_update):
        update_fields = registration_request_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(registration_request, field, value)
        
        self.connection.add(registration_request)
        await self.connection.flush()
        await self.connection.refresh(registration_request)
        return registration_request
    
    async def delete_registration_request(self, registration_request):
        await self.connection.delete(registration_request)
        await self.connection.flush()
        return {"detail": "Registration request deleted"}