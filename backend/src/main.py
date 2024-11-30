import uvicorn

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from db import DBException, DBItemNotFoundError
from dependencies import DBConnection
from models.task import Task, TaskResponse, PartialTask

app = FastAPI()
router = APIRouter(
    prefix="/api",
)

origins = [
    "http://localhost:9000",
    "http://localhost:9001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "PATCH"],
    allow_headers=["Accept", "Accept-Language", "Content-Language", "Content-Type"],
)

db = DBConnection.connect()

# Create a task
@router.post("/tasks")
async def post_task(task: Task) -> TaskResponse:
    try:
        return db.create_task(task)
    except DBException:
        raise HTTPException(status_code=500, detail="DB exception")

# Read tasks
@router.get("/tasks")
async def get_tasks(
    offset: int | None = None,
    limit: int | None = None,
) -> list[TaskResponse]:
    try:
        return db.read_tasks(offset, limit)
    except DBException:
        raise HTTPException(status_code=500, detail="DB exception")

# Read a task by id
@router.get("/tasks/{id}")
async def get_task_by_id(
    id: str,
) -> TaskResponse:
    try:
        return db.read_task_by_id(id)
    except DBItemNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")

# Update a task
@router.patch("/tasks/{id}")
async def patch_task(
    id: str,
    task_patch: PartialTask,
) -> TaskResponse:
    try:
        return db.update_task(id, task_patch)
    except DBItemNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
