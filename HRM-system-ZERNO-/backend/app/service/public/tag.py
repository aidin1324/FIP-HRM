from repository.public.tag import TagRepository

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession


class TagService:
    def __init__(
        self,
        session: AsyncSession,
        tag_repo: TagRepository
    ):
        self.session = session
        self.tag_repo = tag_repo
        
    async def get_tag_by_id(self, tag_id):
        try:
            tag = await self.tag_repo.get_tag_by_id(tag_id)
            return tag
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        
    async def get_all_tags(self):
        try:
            tags = await self.tag_repo.get_all_tags()
            return tags
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def get_tags_by_category_id(self, category_id):
        try:
            tags = await self.tag_repo.get_tags_by_category_id(category_id)
            return tags
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))