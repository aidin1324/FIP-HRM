from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    first_name: str
    second_name: str
    email: EmailStr
    hashed_password: str
    role_id: int
    
    class Config:
        from_attributes = True
        

class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    first_name: str | None
    last_name: str | None
    email: EmailStr | None
    hashed_password: str | None
    

class UserResponse(UserBase):
    id: int
    
    