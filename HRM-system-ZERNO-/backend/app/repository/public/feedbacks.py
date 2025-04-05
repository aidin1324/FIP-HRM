from sqlalchemy.future import select
from app.model import Feedback, WaiterScore
from app.repository.base import BaseRepository
from app.schema.emps.feedbacks import FeedbackCreate, FeedbackUpdate
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

    async def get_waiter_feedback_comments_by_date_pagination(
        self,
        cursor: int = 0,
        limit: int = 5,
        waiter_id: int = None,
        start_date: datetime.datetime = None,
        end_date: datetime.datetime = None,
        ascending: bool = False
    ) -> dict:
        # Build a query selecting only the comment and the feedback id (for pagination)
        query = (
            select(WaiterScore.comment, Feedback.id)
            .join(WaiterScore, Feedback.waiter_score)
        )
        filters = []
        if cursor and ascending:
            filters.append(Feedback.id > cursor)
        elif cursor and not ascending:
            filters.append(Feedback.id < cursor)
        if waiter_id:
            filters.append(WaiterScore.waiter_id == waiter_id)
        if start_date:
            filters.append(Feedback.created_at >= start_date)
        if end_date:
            filters.append(Feedback.created_at <= end_date)

        if filters:
            query = query.where(*filters)

        if ascending:
            query = query.order_by(Feedback.created_at)
        else:
            query = query.order_by(Feedback.created_at.desc())

        # Execute the query with limit for pagination
        result = await self.connection.execute(query.limit(limit))
        rows = result.all()
        # Extract both the comments and their corresponding feedback id
        feedbacks = [{"id": row[1], "comment": row[0]} for row in rows]

        # Use the feedback id from the last row as the new cursor for pagination
        next_cursor = rows[-1][1] if rows else None
            
        return {"feedbacks": feedbacks, "cursor": next_cursor}

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
