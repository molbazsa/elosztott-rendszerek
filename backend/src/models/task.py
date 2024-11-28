from pydantic import BaseModel
from enum import StrEnum

from models.util import PartialModel

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
