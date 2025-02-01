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
        