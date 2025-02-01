from sqlalchemy import select, func
from model import WaiterScore
from repository.base import BaseRepository
from schema.emps.waiters_score import WaiterScoreCreate, WaiterScoreUpdate

class WaiterScoreRepository(BaseRepository):

    async def get_all_waiters(self) -> list[WaiterScore]:
        result = await self.connection.execute(select(WaiterScore))
        waiters = result.scalars().all()
        return list(waiters)

    async def get_waiter_by_id(self, waiter_id: int) -> WaiterScore | None:
        result = await self.connection.execute(select(WaiterScore).filter(WaiterScore.id == waiter_id))
        waiter = result.scalars().first()
        return waiter

    async def get_count_records_by_tag_id(
        self,
        waiter_id: int,
        tag_id: int
    ) -> int:
        query = select(func.count(WaiterScore.id)).where(
            WaiterScore.waiter_id == waiter_id,
            WaiterScore.tag_id == tag_id.id if 
            hasattr(tag_id, 'id') else tag_id
        )
        result = await self.connection.execute(query)
        count = result.scalar_one()
        return count
    
    async def get_count_records_by_filter(self, filters: dict) -> int:
        query = select(func.count(WaiterScore.id))
        
        for field, value in filters.items():
            query = query.where(getattr(WaiterScore, field) == value)
        
        result = await self.connection.execute(query)
        count = result.scalar_one()
        return count
    
    async def create_waiter(self, waiter_create: WaiterScoreCreate) -> WaiterScore:
        waiter = WaiterScore(**waiter_create.model_dump())
        self.connection.add(waiter)
        await self.connection.flush()
        await self.connection.refresh(waiter)
        return waiter

    async def update_waiter(self, waiter: WaiterScore, waiter_update: WaiterScoreUpdate) -> WaiterScore:
        update_fields = waiter_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(waiter, field, value)

        self.connection.add(waiter)
        await self.connection.flush()
        await self.connection.refresh(waiter)
        return waiter

    async def delete_waiter(self, waiter: WaiterScore) -> dict:
        await self.connection.delete(waiter)
        await self.connection.flush()
        return {"detail": "WaiterScore deleted"}