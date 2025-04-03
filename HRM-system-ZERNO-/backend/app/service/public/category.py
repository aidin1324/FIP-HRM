from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from repository.public.category import CategoryRepository
from schema.emps.category import CategoryResponse


class CategoryService:
    def __init__(
        self,
        session: AsyncSession,
        category_repo: CategoryRepository
    ):
        self.session = session
        self.category_repo = category_repo
  
    async def get_category_by_id(self, category_id) -> CategoryResponse:
        try:
            category = await self.category_repo.get_category_by_id(category_id)
            return category
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def get_id_by_category(self, category) -> int | None:
        try:
            category_id = await self.category_repo.get_id_by_category(category)
            return category_id
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def get_all_categories(self) -> list[CategoryResponse]:
        try:
            categories = await self.category_repo.get_all_categories()
            return categories
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def create_category(self, category_create) -> CategoryResponse:
        try:
            async with self.session.begin():
                category = await self.category_repo.create_category(category_create)
            return category
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def update_category(self, category_id, category_update) -> CategoryResponse:
        try:
            async with self.session.begin():
                # Fetch the existing category
                category = await self.category_repo.get_category_by_id(category_id)
                if not category:
                    raise HTTPException(status_code=404, detail="Category not found")
                updated_category = await self.category_repo.update_category(category, category_update)
            return updated_category
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    async def delete_category(self, category_id) -> dict:
        try:
            async with self.session.begin():
                # Fetch the existing category
                category = await self.category_repo.get_category_by_id(category_id)
                if not category:
                    raise HTTPException(status_code=404, detail="Category not found")
                await self.category_repo.delete_category(category)
            return {"detail": "Category deleted"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    