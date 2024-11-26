import uuid

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from enum import StrEnum

app = FastAPI()
router = APIRouter(
    prefix="/api",
)

origins = [
    "http://localhost:9000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Accept", "Accept-Language", "Content-Language", "Content-Type"],
)

tasks = {}

# Task definition
class TaskStatus(StrEnum):
    TO_DO = "to_do"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class Task(BaseModel):
    title: str
    description: str
    assigned_user_id: str
    status: TaskStatus = TaskStatus.TO_DO

class TaskResponse(BaseModel):
    id: str
    task: Task

# Create a task
@router.post("/tasks", response_model=TaskResponse)
async def create_task(task: Task):
    task_id = str(uuid.uuid4())
    tasks[task_id] = task
    return TaskResponse(
        id=task_id,
        task=task,
    )

app.include_router(router)
