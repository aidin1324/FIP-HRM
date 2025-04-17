import requests
import os
from langchain_core.tools import tool
from dotenv import load_dotenv
import logging

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

logger = logging.getLogger(__name__)

@tool(return_direct=True)
def send_feedback_to_manager(conversation_summary: str, comments: str) -> str:
    """
    <What it does>
    Отправляет отчет по отзыву реальному менеджеру в Telegram.
    <What it does>

    <When it needs>
    Когда пользователь оставил свое мнение или рассказал о проблеме, оценил качество обслуживание официанта или остальное касательно ресторана, и диалог завершен. Используется только в самом конце беседы.
    <When it needs>

    Args:
        conversation_summary: Краткое содержание (резюме) диалога. Должно быть подробным пересказом диалога с гостем, не упуская важных деталей.
        comments: Комментарии или отзыв пользователя/системы. Кратко, какие важные моменты было замечено, что можно улучшить, упомянутые важные детали (имена, факты). Это интересные моменты, которые важно оповестить менеджера.

    <Reccomendation>
    conversation_summary: пересказ диалог с гостем, как можно подробней, не упуская важных деталей
    comments: кратко, какие важные моменты было замечено, что можно улучшить, упомянутые важные детали в ходе разговора, как имена или другие эпизодические или факториальная информация. Это интересные моменты которые по твоему важно оповестить менеджера
    <Reccomendation>
    """
    if not BOT_TOKEN or not CHAT_ID:
        error_msg = "Переменные окружения TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не установлены."
        logger.error(error_msg)
        return f"Ошибка конфигурации: {error_msg}"

    message = f"📝 *Новый отзыв от гостя*\n\n"
    message += f"*Резюме диалога:*\n{conversation_summary}\n\n"
    message += f"*Ключевые моменты/Комментарии:*\n{comments}"

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': CHAT_ID,
        'text': message,
        'parse_mode': 'Markdown'
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logger.info(f"Отзыв успешно отправлен в Telegram чат {CHAT_ID}")
        return "Мы уведомим менеджера, благодарим вас!"
    except requests.exceptions.RequestException as e:
        logger.error(f"Ошибка при отправке сообщения в Telegram: {e}")
        return f"Ошибка при отправке отзыва менеджеру: {e}"
    except Exception as e:
        logger.error(f"Неожиданная ошибка при отправке в Telegram: {e}")
        return f"Неожиданная ошибка при отправке отзыва: {e}"
