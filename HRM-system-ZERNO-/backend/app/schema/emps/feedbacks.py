from pydantic import BaseModel
from datetime import datetime
from .comments import CommentResponse
from .contacts import ContactResponse
from .waiters import WaiterResponse
from .rating import RatingResponse, RatingBase


class FeedbackBase(BaseModel):
    is_notified: bool = False
    
    class Config:
        from_attributes = True
        
        
class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(FeedbackBase):
    is_notified: bool | None


class CompleteFeedbackCreate(FeedbackBase):
    comment: str | None = None
    contact: str | None = None
    waiter: str | None = None
    ratings: list[RatingBase]
    
    
class FeedbackResponse(FeedbackBase):
    id: int
    created_at: datetime
    comment: CommentResponse | None = None
    contact: ContactResponse | None = None
    waiter: WaiterResponse | None = None
    ratings: list[RatingResponse] = []