import uvicorn
import requests
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import DBException, DBItemNotFoundError
from dependencies import DBConnection
from models.task import Task, TaskResponse, PartialTask
from commands.command import CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand
from commands.command_manager import CommandManager

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
    allow_methods=["POST", "PATCH", "DELETE"],
    allow_headers=["Accept", "Accept-Language", "Content-Language", "Content-Type"],
)

db = DBConnection.connect()
command_manager = CommandManager(db)

# Create a task with undo/redo support
@router.post("/tasks")
async def post_task_with_undo(task: Task) -> TaskResponse:
    command = CreateTaskCommand(task)
    task_response = command_manager.execute_command(command)
    requests.post("http://notifier-service-proxy:8000/notify", json={
        "message": f"Task '{task.title}' has been created."
    })
    return task_response



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


# Update a task with undo/redo support
@router.patch("/tasks/{id}")
async def patch_task_with_undo(id: str, task_patch: PartialTask) -> TaskResponse:
    command = UpdateTaskCommand(id, task_patch)
    task_response = command_manager.execute_command(command)
    requests.post("http://notifier-service-proxy:8000/notify", json={
        "message": f"Task '{id}' has been updated."
    })
    return task_response


# Delete a task with undo/redo support
@router.delete("/tasks/{id}")
async def delete_task_with_undo(id: str) -> dict[str, str]:
    try:
        command = DeleteTaskCommand(id)
        command_manager.execute_command(command)
        requests.post("http://notifier-service-proxy:8000/notify", json={
            "message": f"Task '{id}' has been deleted."
        })
        return {"message": "Task deleted successfully"}
    except DBItemNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")
    except DBException:
        raise HTTPException(status_code=500, detail="DB exception")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Undo the last operation
@router.post("/undo")
async def undo_last_operation():
    try:
        command_manager.undo()
        requests.post("http://notifier-service-proxy:8000/notify", json={
            "message": f"A change was undone."
        })
        return {"message": "Undo successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Redo the last undone operation
@router.post("/redo")
async def redo_last_operation():
    try:
        command_manager.redo()
        requests.post("http://notifier-service-proxy:8000/notify", json={
            "message": f"A change was redone."
        })
        return {"message": "Redo successful"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
