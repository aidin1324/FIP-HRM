from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    first_name: str
    second_name: str
    email: EmailStr
    role_id: int
    active: bool = False
    
    class Config:
        from_attributes = True
        

class UserCreate(UserBase):
    hashed_password: str


class UserUpdate(UserBase):
    first_name: str | None = None
    second_name: str | None = None
    email: EmailStr | None = None
    role_id: int | None = None
    active: bool | None = None
    

class UserResponse(UserBase):
    id: int
    hashed_password: str
    