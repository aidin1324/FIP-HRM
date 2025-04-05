from app.db.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class FeedbackType(Base):
    __tablename__ = 'feedback_types'
    
    id = Column(Integer, primary_key=True)
    feedback_type = Column(String(255), nullable=False)
    
    ratings = relationship('Rating', back_populates='feedback_type', cascade='all, delete-orphan')
    