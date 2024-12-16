from sqlalchemy.ext.asyncio import AsyncSession

from repository.emps.feedbacks import FeedbackRepository
from repository.emps.feedback_type import FeedbackTypeRepository

import httpx
from config import telegram_token
from model import Feedback

from schema.emps.feedbacks import FeedbackUpdate


class TelegramBotService:
    def __init__(
        self,
        session: AsyncSession,
        feedback_repo: FeedbackRepository,
        feedback_type_repo: FeedbackTypeRepository    
    ):
        self.session = session
        self.feedback_repo = feedback_repo
        self.feedback_type_repo = feedback_type_repo
        
    async def format_feedback(
        self, 
        feedback
    ):
        ratings = []
 
        for rating in feedback.ratings:
            feedback_type = await self.feedback_type_repo.get_feedback_type_by_id(rating.feedback_type_id)
            ratings.append(f"Категория: {feedback_type.feedback_type},\nОценка: {rating.rating}")
            
        return (
            f"📝 Отзыв №{feedback.id}\n"
            f"📅 Время отправки отзыва: {feedback.created_at.strftime('%Y-%m-%d %H:%M')}\n\n"
            f"🤵 Обслуживал: {feedback.waiter.waiter_name if feedback.waiter else "Не указан"}\n"
            f"📞 Контактные данные\n"
            f"Телефон: {feedback.contact.phone if feedback.contact else "Не указан"}\n\n"
            f"⭐ Оценки\n"
            + "\n".join(ratings) + "\n\n"
            f"💬 Комментарий\n"
            f"{feedback.comment.comment if feedback.comment else "Не оставлен"}\n\n"
        )

    async def send_feedback_message(
        self,
        chat_id: int,
        feedback: Feedback 
    ):
        url = f"https://api.telegram.org/bot{telegram_token}/sendMessage"
        
        async with httpx.AsyncClient() as client:
            text = await self.format_feedback(feedback)
            payload = {
                "chat_id": chat_id,
                "text": text
            }
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status() 
                
                 
                result = await self.feedback_repo.update_feedback(
                    feedback=feedback,
                    feedback_update=FeedbackUpdate(
                        is_notified=True
                    )
                )
                await self.session.commit()
                await self.session.close()
                return result
            
            except httpx.HTTPStatusError as e:
                print(f"Не удалось отправить сообщение пользователю {chat_id}: {e}")

        