from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from repository.public .feedback_type import FeedbackTypeRepository
from repository.public .feedbacks import FeedbackRepository
from repository.public .contacts import ContactRepository
from repository.public .rating import RatingRepository
from repository.public.tag import TagRepository
from repository.public.user import UserRepository
from repository.public.registration_request import RegistrationRequestRepository
from repository.public.role import RoleRepositroy
from repository.public.category import CategoryRepository
from repository.public.waiters_score import WaiterScoreRepository

from db.db import get_db

from service.public.feedback_type import FeedbackTypeService
from service.public.feedback import FeedbackService

from service.public.user import UserService
from service.authentication import AuthenticationService
from service.public.registration_request import RegistrationRequest
from service.public.role import RoleService  
from service.stats import StatsService
from service.public.waiters_score import WaiterScoreService
from service.public.category import CategoryService
from service.public.tag import TagService
from service.telegram_bot import TelegramFormatMessageService

def get_feedback_type_repository(
    conn: AsyncSession
) -> FeedbackTypeRepository:
    return FeedbackTypeRepository(conn)


def get_feedback_repository(
    conn: AsyncSession
) -> FeedbackRepository:
    return FeedbackRepository(conn)


def get_contact_repository(
    conn: AsyncSession 
) -> ContactRepository:
    return ContactRepository(conn)


def get_rating_repository(
    conn: AsyncSession
) -> RatingRepository:
    return RatingRepository(conn)


def get_category_repository(
    conn: AsyncSession
) -> CategoryRepository:
    return CategoryRepository(conn)


def get_user_repository(
    conn: AsyncSession
) -> UserRepository:
    return UserRepository(conn)

def get_tag_repository(
    conn: AsyncSession
) -> TagRepository:
    return TagRepository(conn)

def get_registration_request_repository(
    conn: AsyncSession
) -> RegistrationRequestRepository:
    return RegistrationRequestRepository(conn)


def get_waiter_score_repository(
    conn: AsyncSession
) -> WaiterScoreRepository:
    return WaiterScoreRepository(conn)


def get_role_repository(
    conn: AsyncSession
) -> RoleRepositroy:
    return RoleRepositroy(conn)


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
) -> TelegramFormatMessageService:
    feedback_repo = get_feedback_repository(session)
    feedback_type_repo = get_feedback_type_repository(session)
    user_repo = get_user_repository(session)
    category_repo = get_category_repository(session)
    tag_repo = get_tag_repository(session)
    
    return TelegramFormatMessageService(
        session=session,
        feedback_repo=feedback_repo,
        feedback_type_repo=feedback_type_repo,
        user_repo=user_repo,
        category_repo=category_repo,
        tag_repo=tag_repo
    )

def get_tag_service(
    session: AsyncSession = Depends(get_db)
) -> TagService:
    tag_repo = get_tag_repository(session)
    
    return TagService(
        session=session,
        tag_repo=tag_repo
    )
    
def get_category_service(
    session: AsyncSession = Depends(get_db)
) -> CategoryService:
    category_repo = get_category_repository(session)
    
    return CategoryService(
        session=session,
        category_repo=category_repo
    )
    
    
def get_role_service(
    session: AsyncSession = Depends(get_db)
) -> RoleService:
    role_repo = get_role_repository(session)
    
    return RoleService(
        session=session,
        role_repo=role_repo
)


def get_registration_request_service(
    session: AsyncSession = Depends(get_db)
) -> RegistrationRequest:
    registration_request_repo = get_registration_request_repository(session)
    user_service = get_user_service(session)
    
    return RegistrationRequest(
        session=session,
        registration_request_repo=registration_request_repo,
        user_service=user_service
    )
    

def get_waiter_score_service(
    session: AsyncSession = Depends(get_db)
) -> WaiterScoreService:
    waiter_score_repo = get_waiter_score_repository(session)
    
    return WaiterScoreService(
        session=session,
        waiter_score_repo=waiter_score_repo
    )
    
    
def get_authentication_service(
    session: AsyncSession = Depends(get_db)
) -> AuthenticationService:
    user_service = get_user_service(session)
    role_service = get_role_service(session)
    
    return AuthenticationService(
        session=session,
        user_service=user_service,
        role_service=role_service
    )
    

def get_stats_service(
    session: AsyncSession = Depends(get_db)
) -> StatsService:
    waiter_score_service = get_waiter_score_service(session)
    category_service = get_category_service(session)
    tag_service = get_tag_service(session)
    
    return StatsService(
        session=session,
        waiter_score_service=waiter_score_service,
        category_service=category_service,
        tag_service=tag_service
    )
    