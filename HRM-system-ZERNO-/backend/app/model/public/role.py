from app.db.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True)
    role = Column(String(20), unique=True, nullable=False)
    
    users = relationship('User', back_populates='role')
    registration_requests = relationship('RegistrationRequest', back_populates='role')