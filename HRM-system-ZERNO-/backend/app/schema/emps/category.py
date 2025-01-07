from pydantic import BaseModel


class CategoryBase(BaseModel):
    category: str
    
    class Config:
        from_attributes = True
        

class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    category: str | None
    

class CategoryResponse(CategoryBase):
    id: int
