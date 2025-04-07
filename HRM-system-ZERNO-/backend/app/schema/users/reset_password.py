from pydantic import BaseModel, EmailStr


class PasswordResetRequest(BaseModel):
    email: EmailStr
    
    class Config:
        from_attributes = True

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    
    class Config:
        from_attributes = True