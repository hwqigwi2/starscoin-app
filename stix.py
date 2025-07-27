import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = "7371761165:AAFN8A6Vycu284YWmBejkv6YO0xtGpKkxp4"
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)

user_tickets = {}

@dp.message_handler(commands=["start"])
async def start_handler(message: types.Message):
    user_id = message.from_user.id
    args = message.get_args()
    referrer_id = int(args) if args and args.isdigit() and int(args) != user_id else None

    if user_id not in user_tickets:
        user_tickets[user_id] = 3

    web_app_url = f"https://starscoin-app-rc6l.vercel.app?user_id={user_id}"
    if referrer_id:
        web_app_url += f"&referrer={referrer_id}"

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton("Открыть игру 🎰", web_app=WebAppInfo(url=web_app_url))]
    ])

    await message.answer("👋 Добро пожаловать! Нажми кнопку ниже, чтобы открыть мини-приложение:", reply_markup=keyboard)

@dp.message_handler(commands=["tickets"])
async def tickets_cmd(message: types.Message):
    user_id = message.from_user.id
    tickets = user_tickets.get(user_id, 3)
    await message.answer(f"🎟 У вас {tickets} билет(ов).")

async def main():
    await dp.start_polling()

if __name__ == "__main__":
    asyncio.run(main())
