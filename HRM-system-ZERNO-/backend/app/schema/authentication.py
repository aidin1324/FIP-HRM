from pydantic import BaseModel, EmailStr


class TokenCreate(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "email": "aidinror@gmail.com",
            "password": "adi123123"
        }

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"