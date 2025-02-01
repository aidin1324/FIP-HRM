from .public.waiters_score import WaiterScoreService
from .public.category import CategoryService
from .public.tag import TagService

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession


class StatsService:
    def __init__(
        self,
        session: AsyncSession,
        waiter_score_service: WaiterScoreService,
        category_service: CategoryService,
        tag_service: TagService
    ):
        self.session = session
        self.waiter_score_service = waiter_score_service
        self.category_service = category_service
        self.tag_service = tag_service
    
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
        
    async def get_tags_stats(self, waiter_id: int) -> dict:
        """Get tags stats for a waiter

        Args:
            waiter_id (int): Waiter ID
        
        Returns:
            dict: Tags stats
        """
        try:
            positive_category_id = await self.category_service.get_id_by_category("положительный")
            neutral_category_id = await self.category_service.get_id_by_category("нейтральный")
            negative_category_id = await self.category_service.get_id_by_category("негативный")
            
            response = {
                "положительный": {},
                "нейтральный": {},
                "негативный": {}
            }
            
            for category_id, category in [(positive_category_id, "положительный"), (neutral_category_id, "нейтральный"), (negative_category_id, "негативный")]:
                tags = await self.tag_service.get_tags_by_category_id(category_id)
                for tag in tags:
                    tag_id = await self.tag_service.get_tag_by_id(tag.id)
                    
                    c = await self.waiter_score_service.count_records_by_tag_id(
                        **{
                            "waiter_id": waiter_id,
                            "tag_id": tag_id
                        }
                    )
                    response[category][tag.tag] = c
            return response
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
                    
                    