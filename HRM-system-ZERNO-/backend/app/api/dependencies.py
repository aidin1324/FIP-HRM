from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from repository.emps.feedback_type import FeedbackTypeRepository
from repository.emps.feedbacks import FeedbackRepository
from repository.emps.comments import CommentRepository
from repository.emps.contacts import ContactRepository
from repository.emps.rating import RatingRepository

from repository.users import UserRepository

from db.db import get_db

from service.emps.feedback_type import FeedbackTypeService
from service.emps.feedback import FeedbackService
from service.telegram_bot import TelegramBotService

from service.users.user import UserService
from service.authentication import AuthenticationService

def get_feedback_type_repository(
    conn: AsyncSession
) -> FeedbackTypeRepository:
    return FeedbackTypeRepository(conn)


def get_feedback_repository(
    conn: AsyncSession
) -> FeedbackRepository:
    return FeedbackRepository(conn)


def get_comment_repository(
    conn: AsyncSession 
) -> CommentRepository:
    return CommentRepository(conn)


def get_contact_repository(
    conn: AsyncSession 
) -> ContactRepository:
    return ContactRepository(conn)


def get_rating_repository(
    conn: AsyncSession
) -> RatingRepository:
    return RatingRepository(conn)


def get_user_repository(
    conn: AsyncSession
) -> UserRepository:
    return UserRepository(conn)

def get_feedback_service(
    session: AsyncSession = Depends(get_db)
) -> FeedbackService:
    feedback_repo = get_feedback_repository(session)
    
    return FeedbackService(
        session=session,
        feedback_repo=feedback_repo
    )


def get_feedback_type_service(
    session: AsyncSession = Depends(get_db)
) -> FeedbackTypeService:
    feedback_type_repo = get_feedback_type_repository(session)
    
    return FeedbackTypeService(
        session=session,
        feedback_type_repo=feedback_type_repo
    )


def get_user_service(
    session: AsyncSession = Depends(get_db)
) -> UserService:
    user_repo = get_user_repository(session)
    
    return UserService(
        session=session,
        user_repo=user_repo
    )
    
def get_telegram_bot_service(
    session: AsyncSession = Depends(get_db)
) -> TelegramBotService:
    feedback_repo = get_feedback_repository(session)
    feedback_type_repo = get_feedback_type_repository(session)
    
    return TelegramBotService(
        session=session,
        feedback_repo=feedback_repo,
        feedback_type_repo=feedback_type_repo
    )


def get_authentication_service(
    session: AsyncSession = Depends(get_db)
) -> AuthenticationService:
    user_service = get_user_service(session)
    
    return AuthenticationService(
        session=session,
        user_service=user_service
    )