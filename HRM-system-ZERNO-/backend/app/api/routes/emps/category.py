from fastapi import APIRouter, Depends

from service.public.category import CategoryService

from schema.emps.category import CategoryResponse
from api.dependencies import get_category_service

from typing import Annotated

CommonRoleService = Annotated[
    CategoryService,
    Depends(get_category_service)
]

router = APIRouter()


@router.get(
    "/category",
    response_model=list[CategoryResponse],
    summary="Get all categories",
    description="Get all categories",
)
async def get_all_categories(
    category_service: CommonRoleService = CommonRoleService
) -> list[CategoryResponse]:
    """
    Get all categories.

    Args:
        category_service (CommonRoleService): Category service dependency.

    Returns:
        CategoryResponse: Response containing all categories.
    """
    return await category_service.get_all_categories()


@router.get(
    "/category/{category_id}",
    response_model=CategoryResponse,
    summary="Get category by ID",
    description="Get category by ID",
)
async def get_category_by_id(
    category_id: int,
    category_service: CommonRoleService = CommonRoleService
) -> CategoryResponse:
    """
    Get category by ID.

    Args:
        category_id (int): ID of the category to retrieve.
        category_service (CommonRoleService): Category service dependency.

    Returns:
        CategoryResponse: Response containing the category with the specified ID.
    """
    return await category_service.get_category_by_id(category_id)


@router.post(
    "/category",
    response_model=CategoryResponse,
    summary="Create a new category",
    description="Create a new category",
)
async def create_category(
    category: CategoryResponse,
    category_service: CommonRoleService = CommonRoleService
) -> CategoryResponse:
    """
    Create a new category.

    Args:
        category (CategoryResponse): Category data to create.
        category_service (CommonRoleService): Category service dependency.

    Returns:
        CategoryResponse: Response containing the created category.
    """
    return await category_service.create_category(category)


@router.patch(
    "/category/{category_id}",
    response_model=CategoryResponse,
    summary="Update a category",
    description="Update a category",
)
async def update_category(
    category_id: int,
    category: CategoryResponse,
    category_service: CommonRoleService = CommonRoleService
) -> CategoryResponse:
    """
    Update a category.

    Args:
        category_id (int): ID of the category to update.
        category (CategoryResponse): Updated category data.
        category_service (CommonRoleService): Category service dependency.

    Returns:
        CategoryResponse: Response containing the updated category.
    """
    return await category_service.update_category(category_id, category)


@router.delete(
    "/category/{category_id}",
    response_model=CategoryResponse,
    summary="Delete a category",
    description="Delete a category",
)
async def delete_category(
    category_id: int,
    category_service: CommonRoleService = CommonRoleService
) -> CategoryResponse:
    """
    Delete a category.

    Args:
        category_id (int): ID of the category to delete.
        category_service (CommonRoleService): Category service dependency.

    Returns:
        CategoryResponse: Response confirming the deletion of the category.
    """
    return await category_service.delete_category(category_id)
