from fastapi import APIRouter, Depends

from fastapi.responses import JSONResponse

from .authentication import oauth2_scheme
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.db.db import get_db
from app.api.dependencies import get_authentication_service
import json
import os
from pathlib import Path
router = APIRouter()


@router.get("/config.json", response_class=JSONResponse)
async def get_config_json(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
):
    auth_service = get_authentication_service(session)
    
    user = await auth_service.get_current_admin(token)
    
    if not user:
        return JSONResponse(status_code=403, content={"message": "User not found"})
    # Define the config file path
    CONFIG_DIR = Path("backend/app/config")
    CONFIG_FILE = CONFIG_DIR / "app_config.json"

    # Make sure the config directory exists
    os.makedirs(CONFIG_DIR, exist_ok=True)

    # Read the config file, create a default one if it doesn't exist
    if not CONFIG_FILE.exists():
        default_config = {"app_name": "HRM System", "version": "1.0"}
        with open(CONFIG_FILE, "w") as f:
            json.dump(default_config, f, indent=4)
        config_data = default_config
    else:
        with open(CONFIG_FILE, "r") as f:
            config_data = json.load(f)
    return JSONResponse(status_code=200, content={"config": ""})
        
    
    
    
