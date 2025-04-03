from db.db import Base
from sqlalchemy import Column, Integer, DateTime, Boolean
from sqlalchemy.orm import relationship

from datetime import datetime


class Feedback(Base):
    __tablename__ = 'feedbacks'
    
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.now())
    is_notified = Column(Boolean, default=False)
    
    waiter_score = relationship('WaiterScore', back_populates='feedback', uselist=False, cascade='all, delete-orphan', lazy="subquery")    
    contact = relationship('Contact', back_populates='feedback', uselist=False, cascade='all, delete-orphan', lazy="subquery") # for deleting purpose
    ratings = relationship('Rating', back_populates='feedback', cascade='all, delete-orphan', lazy="subquery")
    