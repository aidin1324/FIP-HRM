from .emps.waiters_score import WaiterScoreService
from .emps.category import CategoryService
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession


class StatsService:
    def __init__(
        self,
        session: AsyncSession,
        waiter_score_service: WaiterScoreService,
        category_service: CategoryService
    ):
        self.session = session
        self.waiter_score_service = waiter_score_service
        self.category_service = category_service
    
    async def get_stats_dashboard(self, waiter_id: int) -> dict:
        """Get NPS Dashboard, including total feedbacks, CSAT score, MSAT score, total managers feedback

        Args:
            user_id (int): User ID
        
        Returns:
            dict: stats Dashboard data
        """
        try:
            category_id = await self.category_service.get_id_by_category("положительный")
           
            # Get total number of feedbacks
            positive_feedback = await self.waiter_score_service.count_records_by_filter(
                filter={
                    "waiter_id": waiter_id,
                    "category_id": category_id
                    }
            )
            
            total_feedbacks = await self.waiter_score_service.count_records_by_filter(
                filter={
                    "waiter_id": waiter_id
                    }
            )
            
            # Get CSAT score
            response = {
                "CSAT": round(positive_feedback / total_feedbacks * 100 if total_feedbacks else 0, 1),
                "total_feedbacks": total_feedbacks
            }
            return response
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e)) 