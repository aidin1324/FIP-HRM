from db.db import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True)
    tag = Column(String(50), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'))
    
    waiter_scores = relationship('WaiterScore', back_populates='tag')
    category = relationship('Category', back_populates='tags')
    