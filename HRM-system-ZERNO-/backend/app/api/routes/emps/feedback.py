from fastapi import APIRouter, Depends, BackgroundTasks
from typing import Annotated
from api.dependencies import get_feedback_service, get_telegram_bot_service

from model import Feedback
from service.emps.feedback import FeedbackService
from service.telegram_bot import TelegramBotService
from schema.emps.feedbacks import CompleteFeedbackCreate, FeedbackResponse

from db.db import get_pool_stats
# временное решени
from config import chat_id

router = APIRouter()

CommonFeedbackService = Annotated[
    FeedbackService,
    Depends(get_feedback_service)
]

CommonTelegramBotService = Annotated[
    TelegramBotService,
    Depends(get_telegram_bot_service)
]


@router.post(
    "/create",
    response_model=dict,
    summary="Create new customer feedback",
    description="Create new customer feedback with comments, contacts, and ratings",
)
async def create_feedback(
    background_tasks: BackgroundTasks,
    feedback_create: CompleteFeedbackCreate,
    feedback_service: CommonFeedbackService = CommonFeedbackService,
    telegram_bot_service: CommonTelegramBotService = CommonTelegramBotService
) -> FeedbackResponse:
    
    feedback: Feedback = await feedback_service.create_feedback(feedback_create)
    
    print("POOL STATS\n")
    (await get_pool_stats())
    # result: Feedback = await telegram_bot_service.send_feedback_message(
    #     chat_id=chat_id,
    #     feedback=feedback
    # )

    # background_tasks.add_task(
    #     telegram_bot_service.send_feedback_message,
    #     chat_id=chat_id,
    #     feedback=feedback
    # )
    return {"status": "Feedback created successfully"}


# make pagination!
@router.get(
    "/get_all_feedbacks",
    response_model=list[FeedbackResponse],
    summary="Get all customer feedbacks",
    description="Get all customer feedbacks with comments, contacts, and ratings",
)
async def get_all_feedbacks(
    feedback_service: CommonFeedbackService = CommonFeedbackService
) -> list[FeedbackResponse]:
    feedbacks: list[Feedback] = await feedback_service.get_all_feedbacks()
    return [FeedbackResponse.from_orm(feedback.__dict__) for feedback in feedbacks]
