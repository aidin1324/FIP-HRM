from sqlalchemy.ext.asyncio import AsyncSession

from app.repository.public.category import CategoryRepository
from app.repository.public.tag import TagRepository
from app.repository.public.user import UserRepository
from app.repository.public.feedbacks import FeedbackRepository
from app.repository.public.feedback_type import FeedbackTypeRepository

import httpx
from app.config import telegram_token
from app.model import Feedback

from app.schema.emps.feedbacks import FeedbackUpdate


class TelegramFormatMessageService:
    def __init__(
        self,
        session: AsyncSession,
        feedback_repo: FeedbackRepository,
        feedback_type_repo: FeedbackTypeRepository,
        user_repo: UserRepository, 
        category_repo: CategoryRepository,
        tag_repo: TagRepository   
    ):
        self.session = session
        self.feedback_repo = feedback_repo
        self.feedback_type_repo = feedback_type_repo
        self.user_repo = user_repo
        self.category_repo = category_repo
        self.tag_repo = tag_repo
        
    async def format_feedback(
        self, 
        feedback
    ):
        ratings = []
 
        for rating in feedback.ratings:
            feedback_type = await self.feedback_type_repo.get_feedback_type_by_id(rating.feedback_type_id)
            ratings.append(f"Категория: {feedback_type.feedback_type},\nОценка: {rating.rating}")
            
        user = (await self.user_repo.get_user_by_id(feedback.waiter_score.waiter_id) )if feedback.waiter_score else None
        first_name = user.first_name if user else None
        second_name = user.second_name if user else None
        phone = feedback.contact.phone if feedback.contact else None
        comment = feedback.waiter_score.comment if feedback.waiter_score else None
        score = feedback.waiter_score.score if feedback.waiter_score else None
        category = (await self.category_repo.get_category_by_id(feedback.waiter_score.category_id)).category if feedback.waiter_score.category_id else None
        tag = (await self.tag_repo.get_tag_by_id(feedback.waiter_score.tag_id)).tag if feedback.waiter_score.tag_id else None
        
        return (
            f"📝 Отзыв №{feedback.id}\n"
            f"📅 Время отправки: {feedback.created_at.strftime('%Y-%m-%d %H:%M')}\n\n"
            f"🤵 Обслуживал: "
            f"{first_name if first_name else 'Не указан'} "
            f"{second_name if second_name else ''}\n\n"
            f"📞 Контакт: {phone if feedback.contact else 'Не указан'}\n\n"
            f"⭐ Оценка: {score}\n\n"
            f"🏷 {category} тег: {tag}\n\n"
            f"💬 Комментарий:\n"
            f"{comment if comment else 'Не оставлен'}\n"
        )


            

        