from fastapi import APIRouter, Depends

from app.service.public.registration_request import RegistrationRequest

from app.api.dependencies import get_registration_request_service
from app.schema.users.registration_request import RegistrationRequestResponse, RegistrationRequestUpdate, RegistrationRequestCreate

from typing import Annotated


router = APIRouter()


CommonRegistrationService = Annotated[
    RegistrationRequest,
    Depends(get_registration_request_service)
]


@router.post(
    "/get_all",
    response_model=list[RegistrationRequestResponse],
    summary="Get all user registration requests",
    description="Get all user registration requests with pagination",
)
async def get_all_registration_requests(
    register_service: CommonRegistrationService = CommonRegistrationService
) -> dict:
    registration_requests = await register_service.get_registration_requests_by_cursor()
    return registration_requests


@router.post(
    "/register",
    response_model=dict,
    summary="Send user registration request",
    description="Send user registration request to the admin, filling in the user's email, password, and role",
)
async def register_user(
    request: RegistrationRequestCreate,
    register_service: CommonRegistrationService = CommonRegistrationService
) -> dict:
    await register_service.create_registration_request(request)
    return {"status": "User send registration request successfully"}


@router.post(
    "/status",
    response_model=dict,
    summary="Approve or reject user registration request",
    description="Approve or reject user registration request by id",
)

async def update_registration_request(
    request: RegistrationRequestUpdate,
    request_id: int,
    register_service: CommonRegistrationService = CommonRegistrationService
) -> dict:
    await register_service.update_registration_request(request_id, request)
    return {"status": "User registration request updated successfully"}