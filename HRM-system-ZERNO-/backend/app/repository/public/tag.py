from repository.base import BaseRepository 
from model import Tag
from sqlalchemy.future import select
from schema.emps.tag import TagCreate, TagUpdate


class TagRepository(BaseRepository):
    async def get_all_tags(self) -> list[Tag]:
        result = await self.connection.execute(select(Tag))
        tags = result.scalars().all()
        return list(tags)
    
    async def get_tag_by_id(self, tag_id: int) -> Tag | None:
        result = await self.connection.execute(select(Tag).filter(Tag.id == tag_id))
        tag = result.scalars().first()
        return tag
    
    async def get_tags_by_category_id(self, category_id: int) -> list[Tag]:
        result = await self.connection.execute(select(Tag).filter(Tag.category_id == category_id))
        tags = result.scalars().all()
        return list(tags)
    
    async def count_tags_by_id(self, tag_id: int) -> int:
        """
        Нужно реализовать лучше в агрегированном в виде, из dwh или private scheme
        """
        result = await self.connection.execute(select(Tag).filter(Tag.id == tag_id))
        tags = result.scalars().all()
        return len(tags)
    
    async def create_tag(self, tag_create: TagCreate) -> Tag:
        tag = Tag(**tag_create.model_dump())
        self.connection.add(tag)
        await self.connection.flush()
        await self.connection.refresh(tag)
        return tag
    
    async def update_tag(self, tag: Tag, tag_update: TagUpdate) -> Tag:
        update_fields = tag_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(tag, field, value)
        
        self.connection.add(tag)
        await self.connection.flush()
        await self.connection.refresh(tag)
        return tag
    
    async def delete_tag(self, tag: Tag) -> dict:
        await self.connection.delete(tag)
        await self.connection.flush()
        return {"detail": "Tag deleted"}
    