from fastapi import APIRouter

from .emps.feedback import router as feedback_router
from .users.user import router as user_router
from .users.role import router as role_router
from .users.registration_request import router as registration_request_router

from .authentication import router as authentication_router

router = APIRouter()

router.include_router(feedback_router, prefix="/feedbacks", tags=["feedbacks"])
router.include_router(user_router, prefix="/users", tags=["users"])
router.include_router(role_router, prefix="/roles", tags=["roles"])
router.include_router(registration_request_router, prefix="/registration_requests", tags=["registration_requests"])
router.include_router(authentication_router, prefix="/auth", tags=["auth"])