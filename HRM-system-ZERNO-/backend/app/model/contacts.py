from db.db import Base
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Contact(Base):
    __tablename__ = 'contacts'
    
    id = Column(Integer, primary_key=True)
    phone = Column(String(100), nullable=False)
    feedback_id = Column(Integer, ForeignKey('feedbacks.id'), nullable=False)
    
    feedback = relationship('Feedback', back_populates='contact')
    