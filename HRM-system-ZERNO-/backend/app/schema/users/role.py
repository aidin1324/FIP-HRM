from pydantic import BaseModel


class RoleBase(BaseModel):
    role: str
    
    class Config:
        from_attributes = True
        

class RoleCreate(RoleBase):
    pass


class RoleUpdate(RoleBase):
    role : str | None


class RoleResponse(RoleBase):
    id: int
    
