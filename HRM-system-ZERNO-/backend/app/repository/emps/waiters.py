from sqlalchemy.future import select
from model import Waiter
from repository.base import BaseRepository
from schema.emps.waiters import WaiterCreate, WaiterUpdate

class WaiterRepository(BaseRepository):

    async def get_all_waiters(self) -> list[Waiter]:
        result = await self.connection.execute(select(Waiter))
        waiters = result.scalars().all()
        return list(waiters)

    async def get_waiter_by_id(self, waiter_id: int) -> Waiter | None:
        result = await self.connection.execute(select(Waiter).filter(Waiter.id == waiter_id))
        waiter = result.scalars().first()
        return waiter

    async def create_waiter(self, waiter_create: WaiterCreate) -> Waiter:
        waiter = Waiter(**waiter_create.model_dump())
        self.connection.add(waiter)
        await self.connection.flush()
        await self.connection.refresh(waiter)
        return waiter

    async def update_waiter(self, waiter: Waiter, waiter_update: WaiterUpdate) -> Waiter:
        update_fields = waiter_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(waiter, field, value)

        self.connection.add(waiter)
        await self.connection.flush()
        await self.connection.refresh(waiter)
        return waiter

    async def delete_waiter(self, waiter: Waiter) -> dict:
        await self.connection.delete(waiter)
        await self.connection.flush()
        return {"detail": "Waiter deleted"}