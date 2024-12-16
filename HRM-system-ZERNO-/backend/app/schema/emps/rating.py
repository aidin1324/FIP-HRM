from pydantic import BaseModel


class RatingBase(BaseModel):
    rating: int
    feedback_type_id: int
    
    class Config:
        from_attributes = True


class RatingCreate(RatingBase):
    feedback_id: int


class RatingUpdate(RatingBase):
    feedback_id: int


class RatingResponse(RatingBase):
    id: int
    feedback_id: int