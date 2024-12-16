from pydantic import BaseModel


class WaiterBase(BaseModel):
    waiter_name: str
    feedback_id: int
    
    class Config:
        from_attributes = True


class WaiterCreate(WaiterBase):
    pass


class WaiterUpdate(WaiterBase):
    pass


class WaiterResponse(WaiterBase):
    id: int
