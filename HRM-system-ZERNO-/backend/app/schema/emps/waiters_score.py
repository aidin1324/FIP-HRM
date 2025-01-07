from pydantic import BaseModel


class WaiterScoreBase(BaseModel):
    waiter_id: int
    score: int
    comment: str | None = None
    tag_id: int
     
    class Config:
        from_attributes = True


class WaiterScoreCreate(WaiterScoreBase):
    pass 


class WaiterScoreUpdate(WaiterScoreBase):
    score: int | None
    comment: str | None
    tag_id: int | None
    
    
class WaiterScoreResponse(WaiterScoreBase):
    id: int
    feedback_id: int
    