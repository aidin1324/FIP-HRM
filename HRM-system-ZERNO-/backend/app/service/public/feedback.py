import datetime
from fastapi.exceptions import HTTPException
from model import Feedback, WaiterScore, Contact, Rating
from sqlalchemy.ext.asyncio import AsyncSession

from repository.public.feedbacks import FeedbackRepository

from schema.emps.feedbacks import CompleteFeedbackCreate, FeedbackUpdate


class FeedbackService:
    def __init__(
        self,
        session: AsyncSession,
        feedback_repo: FeedbackRepository
    ):
        self.session = session
        self.feedback_repo = feedback_repo

    async def get_waiter_feedback_comments_by_date(
        self,
        cursor: int = 0,
        limit: int = 5,
        waiter_id: int = None,
        start_date: datetime.datetime = None,
        end_date: datetime.datetime = None,
        ascending: bool = False
    ) -> dict:
        try:
            response = await self.feedback_repo.get_waiter_feedback_comments_by_date_pagination(
                cursor=cursor,
                limit=limit,
                waiter_id=waiter_id,
                start_date=start_date,
                end_date=end_date,
                ascending=ascending
            )
            return response
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def create_feedback(
        self,
        feedback_create: CompleteFeedbackCreate
    ) -> Feedback:
        try:
            feedback = Feedback(
                is_notified=feedback_create.is_notified,
                created_at=datetime.datetime.now()
            )
            
            # Add Waiter Score if provided
            if feedback_create.waiter_score:
                feedback.waiter_score = WaiterScore(
                    **feedback_create.waiter_score.model_dump()
                )
            
            # Add Contact if provided
            if feedback_create.contact:
                feedback.contact = Contact(
                    phone=feedback_create.contact
                )
            
            # Add Ratings
            feedback.ratings = [
                Rating(
                    rating=rating.rating,
                    feedback_type_id=rating.feedback_type_id
                )
                for rating in feedback_create.ratings
            ]
            
            async with self.session.begin() as transaction:
                self.session.add(feedback)
                # create feedback
                # repo comment create comment  by id
                # repo contact create contact by id
                # repo rating create rating by id
            
            await self.session.refresh(feedback, ["contact", "ratings", "waiter_score"])
            return feedback

        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def get_all_feedbacks(self) -> list[Feedback]:
        try:
            async with self.session.begin():
                feedbacks = await self.feedback_repo.get_all_feedbacks()
                return feedbacks
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def update_feedback(
        self,
        feedback: Feedback,
        feedback_update: FeedbackUpdate
    ):
        try:
            updated_feedback = await self.feedback_repo.update_feedback(
                feedback=feedback,
                feedback_update=feedback_update
            )
            return updated_feedback
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def delete_feedback(
        self,
        feedback: Feedback
    ):
        try:
            response = await self.feedback_repo.delete_feedback(feedback=feedback)
            return response
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))