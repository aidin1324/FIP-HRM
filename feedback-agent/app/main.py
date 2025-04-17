from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
import logging
from dotenv import load_dotenv
from typing import List

from app.schemas import ChatRequest, ChatResponse, ChatMessageInput
from app.agent import invoke_agent

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_HISTORY_LENGTH = 20
MAX_MESSAGE_LENGTH = 2000

app = FastAPI(
    title="Feedback Agent API",
    description="API для взаимодействия с AI-агентом сбора обратной связи",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Получен запрос {request.method} {request.url.path} от {request.client.host}")
    response = await call_next(request)
    logger.info(f"Отправлен ответ {response.status_code} для {request.url.path}")
    return response

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Простой эндпоинт для проверки работоспособности сервиса."""
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest, http_request: Request):
    client_host = http_request.client.host
    logger.info(f"Получен запрос /chat от {client_host}")
    logger.info(f"Входящее сообщение: {request.user_message}")

    if len(request.user_message) > MAX_MESSAGE_LENGTH:
        logger.warning(f"Слишком длинное сообщение от {client_host}")
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Сообщение не должно превышать {MAX_MESSAGE_LENGTH} символов."
        )

    history: List[ChatMessageInput] = request.history or []
    logger.info(f"История содержит {len(history)} сообщений")

    if len(history) > MAX_HISTORY_LENGTH:
        logger.warning(f"Слишком длинная история от {client_host}, обрезаем до {MAX_HISTORY_LENGTH} сообщений.")
        history = history[-MAX_HISTORY_LENGTH:]

    try:
        assistant_response = await invoke_agent(request.user_message, history)
        logger.info(f"Ответ агента: {assistant_response}")
        return ChatResponse(assistant_message=assistant_response)
    except ValueError as ve:
        logger.error(f"Ошибка валидации при обработке запроса от {client_host}: {ve}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        logger.error(f"Ошибка выполнения агента для запроса от {client_host}: {re}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ошибка при обработке вашего запроса: {re}")
    except Exception as e:
        logger.exception(f"Неожиданная ошибка при обработке запроса от {client_host}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Внутренняя ошибка сервера.")

@app.post("/chat/stream")
async def handle_chat_stream(request: ChatRequest):
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Потоковая передача пока не реализована.")

@app.get("/")
def read_root():
    return {"message": "Feedback Agent API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
