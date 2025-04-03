from fastapi import HTTPException
from repository.public.feedback_type import FeedbackTypeRepository
from sqlalchemy.ext.asyncio import AsyncSession

class FeedbackTypeService:
    def __init__(
        self,
        session: AsyncSession,
        feedback_type_repo: FeedbackTypeRepository
    ):
        self.session = session
        self.feedback_type_repo = feedback_type_repo
        
    async def get_feedback_type_by_id(self, feedback_type_id):
        try:
            feedback_type = await self.feedback_type_repo.get_feedback_type_by_id(feedback_type_id)
            return feedback_type
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    
    async def get_all_feedback_types(self):
        try:
            feedback_types = await self.feedback_type_repo.get_all_feedback_types()
            return feedback_types
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def create_feedback_type(self, feedback_type_create):
        try:
            async with self.session.begin():
                feedback_type = await self.feedback_type_repo.create_feedback_type(feedback_type_create)
            return feedback_type
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def update_feedback_type(self, feedback_type_id, feedback_type_update):
        try:
            async with self.session.begin():
                feedback_type = await self.feedback_type_repo.get_feedback_type_by_id(feedback_type_id)
                if not feedback_type:
                    raise HTTPException(status_code=404, detail="Feedback type not found")
                
                updated_feedback_type = await self.feedback_type_repo.update_feedback_type(feedback_type, feedback_type_update)
            return updated_feedback_type
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def delete_feedback_type(self, feedback_type_id):
        try:
            async with self.session.begin():
                feedback_type = await self.feedback_type_repo.get_feedback_type_by_id(feedback_type_id)
                if not feedback_type:
                    raise HTTPException(status_code=404, detail="Feedback type not found")
                
                await self.feedback_type_repo.delete_feedback_type(feedback_type)
            return {"detail": "Feedback type deleted"}
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    