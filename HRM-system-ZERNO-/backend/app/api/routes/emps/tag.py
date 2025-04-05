from fastapi import APIRouter, Depends

from app.service.public.tag import TagService

from app.schema.emps.tag import TagCreate, TagResponse, TagUpdate
from app.api.dependencies import get_tag_service

from typing import Annotated

CommonTagService = Annotated[
    TagService,
    Depends(get_tag_service)
]

router = APIRouter()


@router.get(
    "/tag",
    response_model=list[TagResponse],
    summary="Get all tags",
    description="Get all tags",
)
async def get_all_tags(
    tag_service: CommonTagService = CommonTagService
) -> list[TagResponse]:
    """
    Get all tags.

    Args:
        tag_service (CommonTagService): Tag service dependency.

    Returns:
        list[TagResponse]: Response containing all tags.
    """
    return await tag_service.get_all_tags()


@router.get(
    "/tag/{tag_id}",
    response_model=TagResponse,
    summary="Get tag by ID",
    description="Get tag by ID",
)
async def get_tag_by_id(
    tag_id: int,
    tag_service: CommonTagService = CommonTagService
) -> TagResponse:
    """
    Get tag by ID.

    Args:
        tag_id (int): ID of the tag to retrieve.
        tag_service (CommonTagService): Tag service dependency.

    Returns:
        TagResponse: Response containing the tag with the specified ID.
    """
    return await tag_service.get_tag_by_id(tag_id)


@router.post(
    "/tag",
    response_model=TagResponse,
    summary="Create a new tag",
    description="Create a new tag",
)
async def create_tag(
    tag: TagCreate,
    tag_service: CommonTagService = CommonTagService
) -> TagResponse:
    """
    Create a new tag.

    Args:
        tag (TagResponse): Tag data to create.
        tag_service (CommonTagService): Tag service dependency.

    Returns:
        TagResponse: Response containing the created tag.
    """
    return await tag_service.create_tag(tag)


@router.patch(
    "/tag/{tag_id}",
    response_model=TagResponse,
    summary="Update a tag",
    description="Update a tag",
)
async def update_tag(
    tag_id: int,
    tag: TagUpdate,
    tag_service: CommonTagService = CommonTagService
) -> TagResponse:
    """
    Update a tag.

    Args:
        tag_id (int): ID of the tag to update.
        tag (TagResponse): Updated tag data.
        tag_service (CommonTagService): Tag service dependency.

    Returns:
        TagResponse: Response containing the updated tag.
    """
    return await tag_service.update_tag(tag_id, tag)


@router.delete(
    "/tag/{tag_id}",
    response_model=dict,
    summary="Delete a tag",
    description="Delete a tag",
)
async def delete_tag(
    tag_id: int,
    tag_service: CommonTagService = CommonTagService
) -> dict:
    """
    Delete a tag.

    Args:
        tag_id (int): ID of the tag to delete.
        tag_service (CommonTagService): Tag service dependency.

    Returns:
        dict: Response confirming the deletion of the tag.
    """
    return await tag_service.delete_tag(tag_id)
