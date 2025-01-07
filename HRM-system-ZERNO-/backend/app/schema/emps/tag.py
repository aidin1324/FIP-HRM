from pydantic import BaseModel


class TagBase(BaseModel):
    tag: str
    category_id: int
    
    class Config:
        from_attributes = True
        

class TagCreate(TagBase):
    pass


class TagUpdate(TagBase):
    tag: str | None


class TagResponse(TagBase):
    id: int