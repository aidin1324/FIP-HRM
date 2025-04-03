from pydantic import BaseModel
from .rating import RatingResponse


class FeedbackTypeBase(BaseModel):
    feedback_type: str
    
    class Config:
        from_attributes = True
        
        
class FeedbackTypeCreate(FeedbackTypeBase):
    pass


class FeedbackTypeUpdate(FeedbackTypeBase):
    pass


class FeedbackTypeResponse(FeedbackTypeBase):
    id: int
