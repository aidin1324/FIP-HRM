from fastapi.exceptions import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from repository.public.category import CategoryRepository
from schema.emps.category import CategoryCreate, CategoryUpdate, CategoryResponse


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
        