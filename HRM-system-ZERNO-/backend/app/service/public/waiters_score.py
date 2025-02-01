from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from repository.public.waiters_score import WaiterScoreRepository


class WaiterScoreService:
    def __init__(
        self,
        session: AsyncSession,
        waiter_score_repo: WaiterScoreRepository
    ):
        self.session = session
        self.waiter_score_repo = waiter_score_repo
        
    async def count_records_by_filter(self, filter: dict) -> int:
        try:
            return await self.waiter_score_repo.get_count_records_by_filter(filter)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def count_records_by_tag_id(
        self,
        waiter_id: int,
        tag_id: int
    ) -> int:
        try:
            return await self.waiter_score_repo.get_count_records_by_tag_id(waiter_id, tag_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))