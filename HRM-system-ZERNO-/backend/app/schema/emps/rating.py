from pydantic import BaseModel


class RatingBase(BaseModel):
    rating: int
    feedback_type_id: int
    
    class Config:
        from_attributes = True


class RatingCreate(RatingBase):
    pass


class RatingUpdate(RatingBase):
    rating: int | None
    feedback_type_id: int | None


class RatingResponse(RatingBase):
    id: int
    feedback_id: int