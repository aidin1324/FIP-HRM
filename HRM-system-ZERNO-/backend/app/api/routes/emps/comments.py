import datetime
from fastapi import APIRouter, Depends
from typing import Annotated
from app.api.dependencies import get_feedback_service

from app.service.public.feedback import FeedbackService

router = APIRouter()

CommonFeedbackService = Annotated[
    FeedbackService,
    Depends(get_feedback_service)
]


@router.get(
    "/get-customer-waiter-feedbacks-paginated",
    response_model=dict,
    summary="Get customer feedbacks of a waiter(s)",
    description="Get customer feedbacks of a waiter(s) with comments, contacts, and ratings",
)
async def get_customer_feedbacks(
    cursor: int = 0,
    limit: int = 5,
    waiter_id: int = None,
    start_date: datetime.datetime = None,
    end_date: datetime.datetime = None,
    ascending: bool = False,
    feedback_service: CommonFeedbackService = CommonFeedbackService
) -> dict:
    feedbacks = await feedback_service.get_waiter_feedback_comments_by_date(
        cursor=cursor,
        limit=limit,
        waiter_id=waiter_id,
        start_date=start_date,
        end_date=end_date,
        ascending=ascending
    )
    return feedbacks
    
