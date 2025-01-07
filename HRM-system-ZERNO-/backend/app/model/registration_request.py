from db.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey

from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from sqlalchemy import Enum

class StatusEnum(PyEnum):
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'

        
class RegistrationRequest(Base):
    __tablename__ = "registration_requests"
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(50), nullable=False)
    second_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending, nullable=False)
    
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("users.id"))
    
    role = relationship('Role', back_populates='registration_requests')
    admin = relationship('User', back_populates='registration_requests')
    
    def __repr__(self):
        return f"<RegistrationRequest {self.email}>"