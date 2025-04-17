from pydantic import BaseModel
from typing import List, Literal

class ChatMessageInput(BaseModel):
    """Модель для одного сообщения в истории чата"""
    role: Literal['user', 'assistant']
    message: str

class ChatRequest(BaseModel):
    """Модель для входящего запроса на чат"""
    history: List[ChatMessageInput] = []
    user_message: str

class ChatResponse(BaseModel):
    """Модель для ответа чат-бота"""
    assistant_message: str