from abc import ABC, abstractmethod
from models.task import Task, TaskResponse, PartialTask


class Command(ABC):
    @abstractmethod
    def execute(self, db):
        pass

    @abstractmethod
    def undo(self, db):
        pass


class CreateTaskCommand(Command):
    def __init__(self, task: Task):
        self.task = task
        self.task_id = None

    def execute(self, db):
        response = db.create_task(self.task)
        self.task_id = response.id
        return response

    def undo(self, db):
        if self.task_id:
            db.delete_task(self.task_id)


class UpdateTaskCommand(Command):
    def __init__(self, task_id: str, new_data: PartialTask):
        self.task_id = task_id
        self.new_data = new_data
        self.old_data = None

    def execute(self, db):
        original_task = db.read_task_by_id(self.task_id)
        self.old_data = original_task.task
        updated_task = db.update_task(self.task_id, self.new_data)
        return updated_task

    def undo(self, db):
        if self.old_data:
            db.update_task(self.task_id, self.old_data)


class DeleteTaskCommand(Command):
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.deleted_task = None

    def execute(self, db):
        self.deleted_task = db.read_task_by_id(self.task_id)
        db.delete_task(self.task_id)

    def undo(self, db):
        if self.deleted_task:
            db.create_task(self.deleted_task.task)
