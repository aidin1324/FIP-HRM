from aiogram import Bot, Dispatcher, types, Router
import asyncio
import os
from dotenv import load_dotenv
from aiogram.filters import CommandStart, Command
load_dotenv()

API_TOKEN = os.getenv("TELEGRAM_TOKEN")

bot = Bot(token=API_TOKEN)

dp = Dispatcher()

router = Router()
dp.include_router(router)


@router.message(CommandStart())
async def send_welcome(message: types.Message):
    chat_id = message.chat.id
    await message.reply(f"Привет! Ваш chat_id: {chat_id}")


@router.message(Command(commands=['help']))
async def send_help(message: types.Message):
    await message.reply("Справка по использованию бота.")


# Функция запуска бота
if __name__ == '__main__':
    asyncio.run(dp.start_polling(bot))
