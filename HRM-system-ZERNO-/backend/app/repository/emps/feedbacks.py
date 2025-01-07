from sqlalchemy.future import select
from model import Feedback
from repository.base import BaseRepository
from schema.emps.feedbacks import FeedbackCreate, FeedbackUpdate
from sqlalchemy.orm import joinedload, selectinload
import datetime 
class FeedbackRepository(BaseRepository):

    async def get_all_feedbacks(self) -> list[Feedback]:
        result = await self.connection.execute(
            select(Feedback)
            .options(joinedload(Feedback.waiter_score), joinedload(Feedback.contact), selectinload(Feedback.ratings))
            .order_by(Feedback.created_at.desc())
        )
        feedbacks = result.unique().scalars().all()
        return list(feedbacks)

    async def get_feedback_by_id(self, feedback_id: int) -> Feedback | None:
        result = await self.connection.execute(
            select(Feedback)
            .options(
                joinedload(Feedback.waiter_score), 
                joinedload(Feedback.contact), 
                selectinload(Feedback.ratings)
            )
            .where(Feedback.id == feedback_id)
        )
        feedback = result.unique().scalar_one()
        return feedback

    async def create_feedback(self, feedback_create: FeedbackCreate) -> Feedback:
        feedback = Feedback(**feedback_create.model_dump(), created_at=datetime.datetime.now())
        self.connection.add(feedback)
        await self.connection.flush()
        await self.connection.refresh(feedback)
        return feedback

    async def update_feedback(self, feedback: Feedback, feedback_update: FeedbackUpdate) -> Feedback:
        update_fields = feedback_update.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(feedback, field, value)
     
        self.connection.add(feedback)
        await self.connection.flush()
        await self.connection.refresh(feedback)
        return feedback

    async def delete_feedback(self, feedback: Feedback) -> dict:
        await self.connection.delete(feedback)
        await self.connection.flush()
        return {"detail": "Feedback deleted"}
