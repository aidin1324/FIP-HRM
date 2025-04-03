from fastapi import APIRouter, Depends

from service.public.feedback_type import FeedbackTypeService

from schema.emps.feedback_type import FeedbackTypeResponse
from api.dependencies import get_feedback_type_service

from typing import Annotated

CommonFeedbackTypeService = Annotated[
    FeedbackTypeService,
    Depends(get_feedback_type_service)
]

router = APIRouter()


@router.get(
    "/feedback_type",
    response_model=list[FeedbackTypeResponse],
    summary="Get all feedback types",
    description="Get all feedback types",
)
async def get_all_feedback_types(
    feedback_type_service: CommonFeedbackTypeService = CommonFeedbackTypeService
) -> list[FeedbackTypeResponse]:
    """
    Get all feedback types.

    Args:
        feedback_type_service (CommonFeedbackTypeService): Feedback type service dependency.

    Returns:
        list[FeedbackTypeResponse]: Response containing all feedback types.
    """
    return await feedback_type_service.get_all_feedback_types()


@router.get(
    "/feedback_type/{feedback_type_id}",
    response_model=FeedbackTypeResponse,
    summary="Get feedback type by ID",
    description="Get feedback type by ID",
)
async def get_feedback_type_by_id(
    feedback_type_id: int,
    feedback_type_service: CommonFeedbackTypeService = CommonFeedbackTypeService
) -> FeedbackTypeResponse:
    """
    Get feedback type by ID.

    Args:
        feedback_type_id (int): ID of the feedback type to retrieve.
        feedback_type_service (CommonFeedbackTypeService): Feedback type service dependency.

    Returns:
        FeedbackTypeResponse: Response containing the feedback type with the specified ID.
    """
    return await feedback_type_service.get_feedback_type_by_id(feedback_type_id)


@router.post(
    "/feedback_type",
    response_model=FeedbackTypeResponse,
    summary="Create a new feedback type",
    description="Create a new feedback type",
)
async def create_feedback_type(
    feedback_type: FeedbackTypeResponse,
    feedback_type_service: CommonFeedbackTypeService = CommonFeedbackTypeService
) -> FeedbackTypeResponse:
    """
    Create a new feedback type.

    Args:
        feedback_type (FeedbackTypeResponse): Feedback type data to create.
        feedback_type_service (CommonFeedbackTypeService): Feedback type service dependency.

    Returns:
        FeedbackTypeResponse: Response containing the created feedback type.
    """
    return await feedback_type_service.create_feedback_type(feedback_type)


@router.patch(
    "/feedback_type/{feedback_type_id}",
    response_model=FeedbackTypeResponse,
    summary="Update a feedback type",
    description="Update a feedback type",
)
async def update_feedback_type(
    feedback_type_id: int,
    feedback_type: FeedbackTypeResponse,
    feedback_type_service: CommonFeedbackTypeService = CommonFeedbackTypeService
) -> FeedbackTypeResponse:
    """
    Update a feedback type.

    Args:
        feedback_type_id (int): ID of the feedback type to update.
        feedback_type (FeedbackTypeResponse): Updated feedback type data.
        feedback_type_service (CommonFeedbackTypeService): Feedback type service dependency.

    Returns:
        FeedbackTypeResponse: Response containing the updated feedback type.
    """
    return await feedback_type_service.update_feedback_type(feedback_type_id, feedback_type)


@router.delete(
    "/feedback_type/{feedback_type_id}",
    response_model=FeedbackTypeResponse,
    summary="Delete a feedback type",
    description="Delete a feedback type",
)
async def delete_feedback_type(
    feedback_type_id: int,
    feedback_type_service: CommonFeedbackTypeService = CommonFeedbackTypeService
) -> FeedbackTypeResponse:
    """
    Delete a feedback type.

    Args:
        feedback_type_id (int): ID of the feedback type to delete.
        feedback_type_service (CommonFeedbackTypeService): Feedback type service dependency.

    Returns:
        FeedbackTypeResponse: Response confirming the deletion of the feedback type.
    """
    return await feedback_type_service.delete_feedback_type(feedback_type_id)
