from ..dependencies import get_stats_service
from app.service.stats import StatsService

from fastapi import APIRouter, Depends


router = APIRouter()


@router.get(
    "/get_stats/{waiter_id}",
    summary="Get stats dashboard",
    description="Get stats dashboard, CSAT, MSAT, total feedbacks, total manager feedbacks",
)
async def get_stats(
    waiter_id: int = None,
    stats_service: StatsService = Depends(get_stats_service),
) -> dict:
    stats = await stats_service.get_stats_dashboard(waiter_id=waiter_id)
    return stats


@router.get(
    "/get_tags_stats/{waiter_id}",
    summary="Get tags stats",
    description="Get tags stats for a waiter",
)
async def get_tags_stats(
    waiter_id: int = None,
    stats_service: StatsService = Depends(get_stats_service),
) -> dict:
    tags_stats = await stats_service.get_tags_stats(waiter_id=waiter_id)
    return tags_stats
