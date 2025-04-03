from fastapi import APIRouter

from .emps.comments import router as comments_router
from .emps.feedback import router as feedback_router
from .emps.category import router as category_router
from .emps.feedback_type import router as feedback_type_router
from .emps.tag import router as tag_router

from .users.user import router as user_router
from .users.role import router as role_router
from .users.registration_request import router as registration_request_router

from .stats import router as stats_router
from .authentication import router as authentication_router

router = APIRouter()

router.include_router(comments_router, prefix="/comments", tags=["comments"])
router.include_router(feedback_router, prefix="/feedbacks", tags=["feedbacks"])
router.include_router(category_router, prefix="/categories", tags=["categories"])
router.include_router(feedback_type_router, prefix="/feedback_types", tags=["feedback_types"])
router.include_router(tag_router, prefix="/tags", tags=["tags"])

router.include_router(user_router, prefix="/users", tags=["users"])
router.include_router(role_router, prefix="/roles", tags=["roles"])
router.include_router(registration_request_router, prefix="/registration_requests", tags=["registration_requests"])
router.include_router(authentication_router, prefix="/auth", tags=["auth"])
router.include_router(stats_router, prefix="/stats", tags=["stats"])
