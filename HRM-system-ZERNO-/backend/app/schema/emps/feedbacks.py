from pydantic import BaseModel
from datetime import datetime
from .contacts import ContactResponse
from .waiters_score import WaiterScoreResponse, WaiterScoreCreate
from .rating import RatingResponse, RatingCreate


class FeedbackBase(BaseModel):
    is_notified: bool = False
    
    class Config:
        from_attributes = True
        
        
class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(FeedbackBase):
    is_notified: bool | None


class CompleteFeedbackCreate(FeedbackBase):
    contact: str | None = None
    waiter_score: WaiterScoreCreate | None = None
    ratings: list[RatingCreate]
    
    
class FeedbackResponse(FeedbackBase):
    id: int
    created_at: datetime
    contact: ContactResponse | None = None
    waiter_score: WaiterScoreResponse | None = None
    ratings: list[RatingResponse] = []