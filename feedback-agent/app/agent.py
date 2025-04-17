import os
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from typing import List
from langchain_core.prompts import ChatPromptTemplate

from app.tools import send_feedback_to_manager
from app.schemas import ChatMessageInput
from app.promp_template import BASE_PROMPT_TEMPLATE

if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("Переменная окружения OPENAI_API_KEY не установлена.")

tools = [send_feedback_to_manager]

model = ChatOpenAI(model="gpt-4o", temperature=0.7)

prompt_with_history = ChatPromptTemplate.from_messages(
    [
        ("system", BASE_PROMPT_TEMPLATE),
        ("placeholder", "{messages}"),
    ]
)

def format_history(history: List[ChatMessageInput]) -> str:
    """Форматирует историю чата в строку для промпта."""
    if not history:
        return "Нет предыдущей истории."

    formatted_lines = []
    for msg in history:
        if msg.role == 'user':
            formatted_lines.append(f"Human: {msg.message}")
        elif msg.role == 'assistant':
            formatted_lines.append(f"AI: {msg.message}")
    return "\n".join(formatted_lines)

async def invoke_agent(user_message: str, history: List[ChatMessageInput]) -> str:
    """
    Форматирует промпт, создает агент и вызывает его.
    Возвращает ответ ассистента.
    """
    langchain_history: List[BaseMessage] = []
    for msg in history:
        if msg.role == 'user':
            langchain_history.append(HumanMessage(content=msg.message))
        elif msg.role == 'assistant':
            langchain_history.append(AIMessage(content=msg.message))

    messages_for_agent = langchain_history + [HumanMessage(content=user_message)]

    try:
        react_agent = create_react_agent(
            model=model,
            tools=tools,
            prompt=prompt_with_history
        )
    except Exception as e:
        print(f"Ошибка при создании агента: {e}")
        raise RuntimeError(f"Не удалось создать агент: {e}") from e

    try:
        response = await react_agent.ainvoke({"messages": messages_for_agent})

        if response and isinstance(response, dict) and "messages" in response:
            last_message = response["messages"][-1]
            if isinstance(last_message, AIMessage):
                return last_message.content
            elif hasattr(last_message, 'content'):
                 return last_message.content
            else:
                if isinstance(last_message, str):
                    return last_message
                print(f"Неожиданный тип последнего сообщения: {type(last_message)}")
                return "Произошла внутренняя ошибка при обработке ответа."
        else:
             if isinstance(response, str):
                 return response
             print(f"Неожиданный формат ответа от агента: {response}")
             return "Произошла внутренняя ошибка формата ответа."

    except Exception as e:
        print(f"Ошибка при вызове агента: {e}")
        raise RuntimeError(f"Ошибка во время выполнения запроса агентом: {e}") from e
