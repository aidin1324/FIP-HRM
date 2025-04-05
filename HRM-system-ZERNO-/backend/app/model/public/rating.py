from app.db.db import Base
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Rating(Base):
    __tablename__ = 'rating'
    
    id = Column(Integer, primary_key=True)
    rating = Column(Integer, nullable=False)
    feedback_id = Column(Integer, ForeignKey('feedbacks.id'), nullable=False)
    feedback_type_id = Column(Integer, ForeignKey('feedback_types.id'), nullable=False)
    
    feedback = relationship('Feedback', back_populates='ratings')
    feedback_type = relationship('FeedbackType', back_populates='ratings')
    