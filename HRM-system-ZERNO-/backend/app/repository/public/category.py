from repository.base import BaseRepository
from model import Category
from sqlalchemy.future import select
from schema.emps.category import CategoryCreate, CategoryUpdate


class CategoryRepository(BaseRepository):
    async def get_all_categories(self) -> list[Category]:
        result = await self.connection.execute(select(Category))
        categories = result.scalars().all()
        return list(categories)
    
    async def get_category_by_id(self, category_id: int) -> Category | None:
        result = await self.connection.execute(select(Category).filter(Category.id == category_id))
        category = result.scalars().first()
        return category
    
    async def get_id_by_category(self, category: str) -> int | None:
        result = await self.connection.execute(select(Category.id).filter(Category.category == category))
        category_id = result.scalar_one_or_none()
        return category_id
    
    async def create_category(self, category_create: CategoryCreate) -> Category:
        category = Category(**category_create.model_dump())
        self.connection.add(category)
        await self.connection.flush()
        await self.connection.refresh(category)
        return category
    
    async def update_category(self, category: Category, category_update: CategoryUpdate) -> Category:
        update_fields = category_update.dict(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(category, field, value)
        
        self.connection.add(category)
        await self.connection.flush()
        await self.connection.refresh(category)
        return category
    
    async def delete_category(self, category: Category) -> dict:
        await self.connection.delete(category)
        await self.connection.flush()
        return {"detail": "Category deleted"}
    