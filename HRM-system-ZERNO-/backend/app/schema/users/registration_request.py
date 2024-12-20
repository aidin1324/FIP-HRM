from pydantic import BaseModel, EmailStr


class RegistrationRequestBase(BaseModel):
    first_name: str
    second_name: str
    email: EmailStr
    hashed_password: str
    status: str = 'pending'
    role_id: int
    
    class Config:
        from_attributes = True
        

class RegistrationRequestCreate(RegistrationRequestBase):
    pass


class RegistrationRequestUpdate(RegistrationRequestBase):
    first_name: str | None = None
    second_name: str | None = None
    email: EmailStr | None = None
    hashed_password: str | None = None
    status: str | None = None
    role_id: int | None = None
    
    
class RegistrationRequestResponse(RegistrationRequestBase):
    id: int