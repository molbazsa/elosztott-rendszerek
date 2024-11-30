from pydantic import BaseModel, Field
from enum import StrEnum

from models.util import PartialModel

# Task definition
class TaskStatus(StrEnum):
    TO_DO = "to_do"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class Task(BaseModel):
    title: str = Field(..., min_length=1, description="The title of the task cannot be empty.")
    description: str = Field(..., min_length=1, description="The description of the task cannot be empty.")
    assigned_user_id: str
    status: TaskStatus = TaskStatus.TO_DO

class TaskResponse(BaseModel):
    id: str
    task: Task

class PartialTask(Task, PartialModel):
    pass
