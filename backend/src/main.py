import uuid
import itertools

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any
from enum import StrEnum

PAGINATION_LIMIT = 20

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
    allow_methods=["POST", "PATCH"],
    allow_headers=["Accept", "Accept-Language", "Content-Language", "Content-Type"],
)

# https://github.com/pydantic/pydantic/discussions/3089#discussioncomment-8052305
class PartialModel(BaseModel):
    @classmethod
    def __pydantic_init_subclass__(cls, **kwargs: Any) -> None:
        super().__pydantic_init_subclass__(**kwargs)

        for field in cls.model_fields.values():
            field.default = None

        cls.model_rebuild(force=True)

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

class PartialTask(Task, PartialModel):
    pass

# Create a task
@router.post("/tasks")
async def post_task(task: Task) -> TaskResponse:
    task_id = str(uuid.uuid4())
    tasks[task_id] = task
    return TaskResponse(
        id=task_id,
        task=task,
    )

# Read tasks
@router.get("/tasks")
async def get_tasks(
    offset: int | None = None,
    limit: int | None = None,
) -> list[TaskResponse]:
    if offset is None:
        offset = 0

    if limit is None:
        limit = PAGINATION_LIMIT

    task_iterator = (
        TaskResponse(
            id=task_id,
            task=task,
        )
        for task_id, task in tasks.items()
    )

    return itertools.islice(
        task_iterator,
        offset,
        offset + limit
    )

# Read a task by id
@router.get("/tasks/{id}")
async def get_task_by_id(
    id: str,
) -> TaskResponse:
    try:
        return TaskResponse(
            id=id,
            task=tasks[id],
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Task not found")

# Update a task
@router.patch("/tasks/{id}")
async def patch_task(
    id: str,
    task_patch: PartialTask,
) -> TaskResponse:
    if id in tasks:
        for key, value in task_patch.model_dump().items():
            if value is not None:
                setattr(tasks[id], key, value)
    else:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskResponse(
        id=id,
        task=tasks[id],
    )

app.include_router(router)
