from db.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(50), nullable=False, index=True)
    second_name = Column(String(50), nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    active = Column(Boolean, default=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    
    role = relationship('Role', back_populates='users')
    registration_requests = relationship('RegistrationRequest', back_populates='admin', uselist=False)
    scores = relationship('WaiterScore', back_populates='user')
    
    def __repr__(self):
        return f"<User {self.email}>"
    