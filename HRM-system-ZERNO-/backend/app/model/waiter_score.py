from db.db import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class WaiterScore(Base):
    __tablename__ = 'waiter_scores'
    
    id = Column(Integer, primary_key=True)
    score = Column(Integer, nullable=False)
    comment = Column(String(200), nullable=True)
    feedback_id = Column(Integer, ForeignKey('feedbacks.id'), nullable=False)
    waiter_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    tag_id = Column(Integer, ForeignKey('tags.id'), nullable=False)
    
        
    feedback = relationship('Feedback', back_populates='waiter_score')
    user = relationship('User', back_populates='scores')
    tag = relationship('Tag', back_populates='waiter_scores')