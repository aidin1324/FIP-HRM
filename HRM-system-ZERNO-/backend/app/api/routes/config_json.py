from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Annotated, List, Optional
import json
import os
import uuid
from pathlib import Path

from .authentication import oauth2_scheme
from sqlalchemy.ext.asyncio import AsyncSession
from db.db import get_db
from api.dependencies import get_authentication_service

router = APIRouter()

# Pydantic models for request/response
class ChatIdBase(BaseModel):
    chat_id: str

class ChatIdCreate(ChatIdBase):
    pass

class ChatIdResponse(ChatIdBase):
    id: str

# Helper functions for config file operations
def read_config():
    CONFIG_DIR = Path("backend/app/config")
    CONFIG_FILE = CONFIG_DIR / "app_config.json"
    
    os.makedirs(CONFIG_DIR, exist_ok=True)
    
    if not CONFIG_FILE.exists():
        default_config = {
            "app_name": "HRM System",
            "version": "1.0",
            "telegram_chat_ids": []
        }
        with open(CONFIG_FILE, "w") as f:
            json.dump(default_config, f, indent=4)
        return default_config
    else:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)

def write_config(config_data):
    CONFIG_DIR = Path("backend/app/config")
    CONFIG_FILE = CONFIG_DIR / "app_config.json"
    
    os.makedirs(CONFIG_DIR, exist_ok=True)
    
    with open(CONFIG_FILE, "w") as f:
        json.dump(config_data, f, indent=4)

# 1. Get all Telegram chat IDs
@router.get("/config/telegram_chat_ids", response_model=List[ChatIdResponse])
async def get_all_telegram_chat_ids(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
):
    auth_service = get_authentication_service(session)
    user = await auth_service.get_current_admin(token)
    
    if not user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config_data = read_config()
    return config_data.get("telegram_chat_ids", [])

# 2. Get specific Telegram chat ID by UUID
@router.get("/config/telegram_chat_ids/{id}", response_model=ChatIdResponse)
async def get_telegram_chat_id(
    id: str,
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
):
    auth_service = get_authentication_service(session)
    user = await auth_service.get_current_admin(token)
    
    if not user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config_data = read_config()
    
    for chat_id_obj in config_data.get("telegram_chat_ids", []):
        if chat_id_obj.get("id") == id:
            return chat_id_obj
    
    raise HTTPException(status_code=404, detail="Chat ID not found")

# 3. Add new Telegram chat ID
@router.post("/config/telegram_chat_ids", response_model=ChatIdResponse, status_code=201)
async def add_telegram_chat_id(
    chat_id_data: ChatIdCreate,
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
):
    auth_service = get_authentication_service(session)
    user = await auth_service.get_current_admin(token)
    
    if not user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config_data = read_config()
    
    # Generate UUID for new chat ID
    new_id = str(uuid.uuid4())
    
    # Create new chat ID object
    new_chat_id = {
        "id": new_id,
        "chat_id": chat_id_data.chat_id
    }
    
    # Check if this chat_id already exists
    for existing_chat in config_data.get("telegram_chat_ids", []):
        if existing_chat.get("chat_id") == chat_id_data.chat_id:
            raise HTTPException(status_code=400, detail="Chat ID already exists")
    
    # Add to list
    if "telegram_chat_ids" not in config_data:
        config_data["telegram_chat_ids"] = []
    
    config_data["telegram_chat_ids"].append(new_chat_id)
    write_config(config_data)
    
    return new_chat_id

# 4. Update Telegram chat ID
@router.put("/config/telegram_chat_ids/{id}", response_model=ChatIdResponse)
async def update_telegram_chat_id(
    id: str,
    chat_id_data: ChatIdCreate,
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
):
    auth_service = get_authentication_service(session)
    user = await auth_service.get_current_admin(token)
    
    if not user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config_data = read_config()
    
    # Find and update the chat ID
    telegram_chat_ids = config_data.get("telegram_chat_ids", [])
    for i, chat_id_obj in enumerate(telegram_chat_ids):
        if chat_id_obj.get("id") == id:
            updated_chat_id = {
                "id": id,
                "chat_id": chat_id_data.chat_id
            }
            telegram_chat_ids[i] = updated_chat_id
            config_data["telegram_chat_ids"] = telegram_chat_ids
            write_config(config_data)
            return updated_chat_id
    
    raise HTTPException(status_code=404, detail="Chat ID not found")

# 5. Delete Telegram chat ID
@router.delete("/config/telegram_chat_ids/{id}")
async def delete_telegram_chat_id(
    id: str,
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db),
):
    auth_service = get_authentication_service(session)
    user = await auth_service.get_current_admin(token)
    
    if not user:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config_data = read_config()
    
    # Find and delete the chat ID
    telegram_chat_ids = config_data.get("telegram_chat_ids", [])
    for i, chat_id_obj in enumerate(telegram_chat_ids):
        if chat_id_obj.get("id") == id:
            deleted = telegram_chat_ids.pop(i)
            config_data["telegram_chat_ids"] = telegram_chat_ids
            write_config(config_data)
            return {"message": "Chat ID deleted successfully", "deleted": deleted}
    
    raise HTTPException(status_code=404, detail="Chat ID not found")