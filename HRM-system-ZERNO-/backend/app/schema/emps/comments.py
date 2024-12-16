from pydantic import BaseModel


class CommentBase(BaseModel):
    comment: str
    
    class Config:
        from_attributes = True
            

class CommentCreate(CommentBase):
    feedback_id: int


class CommentUpdate(CommentBase):
    comment: str | None


class CommentResponse(CommentBase):
    id: int
    