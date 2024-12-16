from db.db import Base
from sqlalchemy import Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship


class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True)
    comment = Column(Text, nullable=False)
    feedback_id = Column(Integer, ForeignKey('feedbacks.id'), nullable=False)
    
    feedback = relationship('Feedback', back_populates='comment')
    