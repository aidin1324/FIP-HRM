from pydantic import BaseModel


class ContactBase(BaseModel):
    phone: str
    feedback_id: int
    
    class Config:
        from_attributes = True


class ContactCreate(ContactBase):
    pass


class ContactUpdate(ContactBase):
    pass


class ContactResponse(ContactBase):
    id: int
