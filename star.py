from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor

bot = Bot(token="7371761165:AAFN8A6Vycu284YWmBejkv6YO0xtGpKkxp4")
dp = Dispatcher(bot)

# Словарь для хранения билетов (вместо БД для простоты)
user_tickets = {}
referrals_count = {}

@dp.message_handler(commands=['start'])
async def start_handler(message: types.Message):
    args = message.get_args()  # Получаем аргументы после /start
    referrer_id = None
    if args:
        referrer_id = args.strip()

    user_id = message.from_user.id

    # Если есть реферер и он не сам себя пригласил
    if referrer_id and referrer_id.isdigit() and int(referrer_id) != user_id:
        referrer_id = int(referrer_id)
        # Начисляем билет рефереру
        referrals_count[referrer_id] = referrals_count.get(referrer_id, 0) + 1
        user_tickets[referrer_id] = user_tickets.get(referrer_id, 3) + 1  # исходные 3 билета +1 за реферала

        await bot.send_message(referrer_id, f"🎉 Вам начислен 1 билет за приглашение пользователя {message.from_user.full_name}!")

    # Приветственное сообщение новому пользователю
    user_tickets.setdefault(user_id, 3)  # по умолчанию 3 билета
    await message.answer("Добро пожаловать! У вас 3 билета для игры.")

if __name__ == "__main__":
    executor.start_polling(dp)
