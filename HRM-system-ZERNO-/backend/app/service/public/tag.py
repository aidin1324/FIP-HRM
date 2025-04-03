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
        
    async def create_tag(self, tag_create):
        try:
            async with self.session.begin():
                tag = await self.tag_repo.create_tag(tag_create)
            return tag
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def update_tag(self, tag_id, tag_update):
        try:
            async with self.session.begin():
                tag = await self.tag_repo.get_tag_by_id(tag_id)
                if not tag:
                    raise HTTPException(status_code=404, detail="Tag not found")
                
                updated_tag = await self.tag_repo.update_tag(tag, tag_update)
            return updated_tag
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def delete_tag(self, tag_id):
        try:
            async with self.session.begin():
                tag = await self.tag_repo.get_tag_by_id(tag_id)
                if not tag:
                    raise HTTPException(status_code=404, detail="Tag not found")
                
                await self.tag_repo.delete_tag(tag)
            return {"detail": "Tag deleted"}
        
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        