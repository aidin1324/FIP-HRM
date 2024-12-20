from db.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "private"}
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(50), nullable=False)
    second_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    role_id = Column(Integer, ForeignKey("private.roles.id"))
    
    role = relationship('Role', back_populates='users')
    registration_requests = relationship('RegistrationRequest', back_populates='admin', uselist=False)
    
    def __repr__(self):
        return f"<User {self.email}>"
    