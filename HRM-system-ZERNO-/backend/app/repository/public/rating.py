from sqlalchemy.future import select
from app.model import Rating
from app.repository.base import BaseRepository
from app.schema.emps.rating import RatingCreate, RatingUpdate


class RatingRepository(BaseRepository):

    async def get_all_ratings(
            self
    ) -> list[Rating]:
        result = await self.connection.execute(select(Rating))
        ratings = result.scalars().all()
        return list(ratings)

    async def get_rating_by_id(
            self,
            rating_id: int
    ) -> Rating | None:
        result = await self.connection.execute(select(Rating).filter(Rating.id == rating_id))
        rating = result.scalars().first()
        return rating

    async def create_rating(
            self,
            rating_create: RatingCreate
    ) -> Rating:
        rating = Rating(**rating_create.model_dump())
        self.connection.add(rating)
        await self.connection.flush()
        await self.connection.refresh(rating)
        return rating

    async def update_rating(
            self,
            rating: Rating,
            rating_update: RatingUpdate
    ) -> Rating:
        update_fields = rating_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(rating, field, value)

        self.connection.add(rating)

        await self.connection.flush()
        await self.connection.refresh(rating)
        return rating

    async def delete_rating(
            self,
            rating: Rating
    ) -> dict:
        await self.connection.delete(rating)
        await self.connection.flush()
        return {"detail": "Rating deleted"}
