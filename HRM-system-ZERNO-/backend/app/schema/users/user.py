from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role_id: int
    status: str = 'pending'
    
    class Config:
        from_attributes = True
        

class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    first_name: str | None
    last_name: str | None
    email: EmailStr | None
    password: str | None
    status: str | None

class UserResponse(UserBase):
    id: int
    
    