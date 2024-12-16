from db.db import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Waiter(Base):
    __tablename__ = 'waiters'
    
    id = Column(Integer, primary_key=True)
    waiter_name = Column(String, nullable=False)
    feedback_id = Column(Integer, ForeignKey('feedbacks.id'), nullable=False)
    
    feedback = relationship('Feedback', back_populates='waiter')
    