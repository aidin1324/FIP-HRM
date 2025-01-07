from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from repository.emps.feedback_type import FeedbackTypeRepository
from repository.emps.feedbacks import FeedbackRepository
from repository.emps.contacts import ContactRepository
from repository.emps.rating import RatingRepository

from repository.users.user import UserRepository
from repository.users.registration_request import RegistrationRequestRepository
from repository.users.role import RoleRepositroy

from db.db import get_db

from service.emps.feedback_type import FeedbackTypeService
from service.emps.feedback import FeedbackService
from service.telegram_bot import TelegramBotService

from service.users.user import UserService
from service.authentication import AuthenticationService
from service.users.registration_request import RegistrationRequest
from service.users.role import RoleService  


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


def get_user_repository(
    conn: AsyncSession
) -> UserRepository:
    return UserRepository(conn)


def get_registration_request_repository(
    conn: AsyncSession
) -> RegistrationRequestRepository:
    return RegistrationRequestRepository(conn)


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
) -> TelegramBotService:
    feedback_repo = get_feedback_repository(session)
    feedback_type_repo = get_feedback_type_repository(session)
    
    return TelegramBotService(
        session=session,
        feedback_repo=feedback_repo,
        feedback_type_repo=feedback_type_repo
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
    