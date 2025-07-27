from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
from aiogram import Bot

BOT_TOKEN = "7371761165:AAFN8A6Vycu284YWmBejkv6YO0xtGpKkxp4"
bot = Bot(token=BOT_TOKEN)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user_tickets: Dict[int, int] = {}
referrals_count: Dict[int, int] = {}
already_referred: Dict[int, int] = {}

class RefRequest(BaseModel):
    inviter: int
    user: int

@app.post("/api/register-ref")
async def register_ref(data: RefRequest):
    if data.inviter == data.user:
        return {"status": "self-referral"}

    if already_referred.get(data.user):
        return {"status": "already-registered"}

    already_referred[data.user] = data.inviter
    user_tickets[data.user] = user_tickets.get(data.user, 3)
    user_tickets[data.inviter] = user_tickets.get(data.inviter, 3) + 1
    referrals_count[data.inviter] = referrals_count.get(data.inviter, 0) + 1

    try:
        await bot.send_message(data.inviter, f"🎉 Вам начислен 1 билет за приглашённого пользователя {data.user}!")
    except Exception:
        pass

    return {"status": "ok", "inviter": data.inviter, "user": data.user}

@app.get("/api/get-tickets")
def get_tickets(user_id: int):
    return {"user_id": user_id, "tickets": user_tickets.get(user_id, 3)}
