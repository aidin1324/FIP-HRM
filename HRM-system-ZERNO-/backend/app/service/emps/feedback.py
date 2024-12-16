import datetime
from fastapi.exceptions import HTTPException
from model import Feedback, Contact, Comment, Rating, Waiter
from sqlalchemy.ext.asyncio import AsyncSession

from repository.emps.feedbacks import FeedbackRepository

from schema.emps.feedbacks import CompleteFeedbackCreate, FeedbackCreate, FeedbackUpdate


class FeedbackService:
    def __init__(
        self,
        session: AsyncSession,
        feedback_repo: FeedbackRepository
    ):
        self.session = session
        self.feedback_repo = feedback_repo

    async def create_feedback(
        self,
        feedback_create: CompleteFeedbackCreate
    ) -> Feedback:
        try:
            feedback = Feedback(
                is_notified=feedback_create.is_notified,
                created_at=datetime.datetime.now()
            )

            # Add Comment if provided
            if feedback_create.comment:
                feedback.comment = Comment(
                    comment=feedback_create.comment
                )

            # Add Contact if provided
            if feedback_create.contact:
                feedback.contact = Contact(
                    phone=feedback_create.contact
                )

            if feedback_create.waiter:
                feedback.waiter = Waiter(
                    waiter_name=feedback_create.waiter 
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
            
            await self.session.refresh(feedback, ["comment", "contact", "ratings", "waiter"])
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