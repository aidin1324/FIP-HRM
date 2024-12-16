from sqlalchemy.future import select
from model import FeedbackType
from repository.base import BaseRepository
from schema.emps.feedback_type import FeedbackTypeCreate, FeedbackTypeUpdate


class FeedbackTypeRepository(BaseRepository):

    async def get_all_feedback_types(self) -> list[FeedbackType]:
        result = await self.connection.execute(select(FeedbackType))
        feedback_types = result.scalars().all()
        return list(feedback_types)

    async def get_feedback_type_by_id(self, feedback_type_id: int) -> FeedbackType | None:
        result = await self.connection.execute(
            select(FeedbackType).filter(FeedbackType.id == feedback_type_id)
        )
        feedback_type = result.scalars().first()
        return feedback_type

    async def create_feedback_type(self, feedback_type_create: FeedbackTypeCreate) -> FeedbackType:
        feedback_type = FeedbackType(**feedback_type_create.model_dump())
        self.connection.add(feedback_type)
        await self.connection.flush()
        await self.connection.refresh(feedback_type)
        return feedback_type

    async def update_feedback_type(
        self, 
        feedback_type: FeedbackType, 
        feedback_type_update: FeedbackTypeUpdate
    ) -> FeedbackType:
        update_fields = feedback_type_update.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(feedback_type, field, value)

        self.connection.add(feedback_type)
        await self.connection.flush()
        await self.connection.refresh(feedback_type)
        return feedback_type

    async def delete_feedback_type(self, feedback_type: FeedbackType) -> dict:
        await self.connection.delete(feedback_type)
        await self.connection.flush()
        return {"detail": "Feedback type deleted"}
