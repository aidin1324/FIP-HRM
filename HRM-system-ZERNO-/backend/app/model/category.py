from db.db import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    category = Column(String(50), nullable=False)
    
    tags = relationship('Tag', back_populates='category', cascade='all, delete', lazy="subquery")
    