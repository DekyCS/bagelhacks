import os
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from livekit.api import LiveKitAPI, ListRoomsRequest, AccessToken, VideoGrants
from livekit.agents import cli, WorkerOptions
from fastapi import BackgroundTasks
from fastapi.responses import RedirectResponse

initial_prompt = ""

load_dotenv(".env.local")

LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def generate_room_name():
    name = "room-" + str(uuid.uuid4())[:8]
    rooms = await get_rooms()
    while name in rooms:
        name = "room-" + str(uuid.uuid4())[:8]
    return name

async def get_rooms():
    api = LiveKitAPI(url=LIVEKIT_URL)
    rooms = await api.room.list_rooms(ListRoomsRequest())
    await api.aclose()
    return [room.name for room in rooms.rooms]

@app.get("/getToken")
async def get_token(name: str = "my name", room: str = None):
    # FastAPI automatically parses query parameters
    if not room:
        room = await generate_room_name()
    
    token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET) \
        .with_identity(name) \
        .with_name(name) \
        .with_grants(VideoGrants(
            room_join=True,
            room=room
        ))
    
    return {"token": token.to_jwt()}

@app.post("/form")
async def form(request: Request, background_tasks: BackgroundTasks):
    import subprocess
    import os
    
    agent_dir = os.path.join(os.path.dirname(__file__))
    
    #initial_prompt = await request.form()

    initial_prompt = "You are a cat"

    subprocess.Popen(
        "python agent.py dev",
        shell=True,
        cwd=agent_dir
    )
    
    return RedirectResponse(url="/interview", status_code=303)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001, log_level="info")