import asyncio
from fastapi import APIRouter, Depends, BackgroundTasks
from typing import Annotated

import httpx
from app.api.dependencies import get_feedback_service, get_telegram_bot_service

from app.model import Feedback
from app.service.public.feedback import FeedbackService
from app.service.telegram_bot import TelegramFormatMessageService
from app.schema.emps.feedbacks import CompleteFeedbackCreate, FeedbackResponse

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db, get_pool_stats
from ..config_json import read_config

from dotenv import load_dotenv
import os 
load_dotenv()

telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
# временное решени

router = APIRouter()

CommonFeedbackService = Annotated[
    FeedbackService,
    Depends(get_feedback_service)
]

CommonTelegramFormatMessageService = Annotated[
    TelegramFormatMessageService,
    Depends(get_telegram_bot_service)
]

async def send_feedback_messages(
    telegram_token: str,
    text: str,
    chat_ids: list[str],
):
        url = f"https://api.telegram.org/bot{telegram_token}/sendMessage"
        task = []
        async def send_message(chat_id: str): 
            async with httpx.AsyncClient() as client:
                payload = {
                    "chat_id": chat_id,
                    "text": text
                }
                try:
                    response = await client.post(url, json=payload)
                    response.raise_for_status()  # Raise an error for bad responses
                except httpx.HTTPStatusError as e:
                    print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
                except Exception as e:
                    print(f"An error occurred: {str(e)}")
                else:
                    if response.status_code == 200:
                        print("Message sent successfully.")
                    else:
                        print(f"Failed to send message. Status code: {response.status_code}")
                        
        for chat_id in chat_ids:
            task.append(send_message(chat_id))
        await asyncio.gather(*task)
                    
@router.post(
    "/create",
    response_model=dict,
    summary="Create new customer feedback",
    description="Create new customer feedback with comments, contacts, and ratings",
)
async def create_feedback(
    background_tasks: BackgroundTasks,
    feedback_create: CompleteFeedbackCreate,
    session: AsyncSession = Depends(get_db),
) -> FeedbackResponse:
    
    feedback_service: FeedbackService = get_feedback_service(session)
    telegram_format_message_service: TelegramFormatMessageService = get_telegram_bot_service(session)
    
    feedback: Feedback = await feedback_service.create_feedback(feedback_create)
    
    print("POOL STATS\n")
    (await get_pool_stats())
    
    text = await telegram_format_message_service.format_feedback(feedback)
    config_data = read_config()
    telegram_chat_ids = [data["chat_id"] for data in config_data.get("telegram_chat_ids", [])]
    print("SENDING FROM BOT:" + str(telegram_bot_token))
    background_tasks.add_task(
        send_feedback_messages,
        telegram_token=telegram_bot_token,
        text=text,
        chat_ids=telegram_chat_ids,
    )
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


@router.delete(
    "/delete/{feedback_id}",
    response_model=dict,
    summary="Delete customer feedback",
    description="Delete customer feedback by id",
)
async def delete_feedback(
    feedback_id: int,
    feedback_service: CommonFeedbackService = CommonFeedbackService
) -> dict:
    await feedback_service.delete_feedback(feedback_id)
    return {"status": "Feedback deleted successfully"}
