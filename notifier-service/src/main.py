from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS setup
origins = [
    "http://localhost:9000",
    "http://localhost:9001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket manager
class TaskPublisher:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def subscribe(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def unsubscribe(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def notifySubscribers(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

taskPublisher = TaskPublisher()

# WebSocket endpoint (subscribe)
@app.websocket("/ws/notify")
async def websocket_endpoint(websocket: WebSocket):
    await taskPublisher.subscribe(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        taskPublisher.unsubscribe(websocket)

# REST API to receive notifications
@app.post("/notify")
async def notify_change(change: dict):
    message = f"Task Update: {change['message']}"
    await taskPublisher.notifySubscribers(message)
    return {"status": "Notification sent"}
