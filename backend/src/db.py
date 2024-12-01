import uuid
import itertools

from abc import ABC, abstractmethod
from pymongo import MongoClient
from bson.objectid import ObjectId

from constants import PAGINATION_LIMIT
from models.task import Task, TaskResponse, PartialTask


# Exceptions
class DBException(Exception):
    pass


class DBItemNotFoundError(DBException):
    pass


# Factory Method Pattern
# https://refactoring.guru/design-patterns/factory-method/python/example#example-0
class DB(ABC):
    """
    The Product interface declares the operations that all concrete products
    must implement.
    """

    @abstractmethod
    def create_task(self, task: Task) -> TaskResponse:
        pass

    @abstractmethod
    def read_tasks(
        self,
        offset: int | None = None,
        limit: int | None = None,
    ) -> list[TaskResponse]:
        pass

    @abstractmethod
    def read_task_by_id(
        self,
        id: str,
    ) -> TaskResponse:
        pass

    @abstractmethod
    def update_task(
        self,
        id: str,
        task_patch: PartialTask,
    ) -> TaskResponse:
        pass

    @abstractmethod
    def delete_task(
        self,
        id: str,
    ) -> None:
        pass


"""
Concrete Products provide various implementations of the Product interface.
"""


class MongoDB(DB):
    DB_NAME = "task-manager"

    def __init__(self, mongo_client) -> None:
        self.client = mongo_client
        self.db = mongo_client[MongoDB.DB_NAME]

    def create_task(self, task: Task) -> TaskResponse:
        result = self.db["tasks"].insert_one(task.model_dump())
        task = self.db["tasks"].find_one({
            "_id": result.inserted_id
        })
        return TaskResponse(
            id=str(task["_id"]),
            task={
                key: val
                for key, val in task.items()
                if key != "_id"
            },
        )

    def read_tasks(
        self,
        offset: int | None = None,
        limit: int | None = None,
    ) -> list[TaskResponse]:
        if offset is None:
            offset = 0

        if limit is None:
            limit = PAGINATION_LIMIT

        tasks = self.db["tasks"].find().skip(offset).limit(limit)

        task_iterator = (
            TaskResponse(
                id=str(task["_id"]),
                task={
                    key: val
                    for key, val in task.items()
                    if key != "_id"
                },
            )
            for task in tasks
        )

        return itertools.islice(
            task_iterator,
            offset,
            offset + limit
        )

    def read_task_by_id(
        self,
        id: str,
    ) -> TaskResponse:
        task = self.db["tasks"].find_one({
            "_id": ObjectId(id)
        })
        return TaskResponse(
            id=str(task["_id"]),
            task={
                key: val
                for key, val in task.items()
                if key != "_id"
            },
        )

    def update_task(
        self,
        id: str,
        task_patch: PartialTask,
    ) -> TaskResponse:
        result = self.db["tasks"].update_one(
            {"_id": ObjectId(id)},
            {"$set": task_patch.model_dump()}
        )
        task = self.db["tasks"].find_one({
            "_id": ObjectId(id)
        })
        return TaskResponse(
            id=id,
            task={
                key: val
                for key, val in task.items()
                if key != "_id"
            },
        )

    def delete_task(self, id: str) -> None:
        """
        Deletes a task by its ID.
        
        Args:
            id (str): The ID of the task to delete.
        
        Raises:
            DBItemNotFoundError: If the task does not exist.
        """
        self.db["tasks"].delete_one({
            "_id": ObjectId(id)
        })


class MockDB(DB):
    def __init__(self):
        self.tasks = {}

    def create_task(self, task: Task) -> TaskResponse:
        task_id = str(uuid.uuid4())
        self.tasks[task_id] = task
        return TaskResponse(
            id=task_id,
            task=task,
        )

    def read_tasks(
        self,
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
            for task_id, task in self.tasks.items()
        )

        return itertools.islice(
            task_iterator,
            offset,
            offset + limit
        )

    def read_task_by_id(
        self,
        id: str,
    ) -> TaskResponse:
        try:
            return TaskResponse(
                id=id,
                task=self.tasks[id],
            )
        except KeyError:
            raise DBItemNotFoundError("Task not found")

    def update_task(
        self,
        id: str,
        task_patch: PartialTask,
    ) -> TaskResponse:
        try:
            for key, value in task_patch.model_dump().items():
                if value is not None:
                    setattr(self.tasks[id], key, value)
        except KeyError:
            raise DBItemNotFoundError("Task not found")

        return TaskResponse(
            id=id,
            task=self.tasks[id],
        )

    def delete_task(self, id: str) -> None:
        """
        Deletes a task by its ID.

        Args:
            id (str): The ID of the task to delete.

        Raises:
            DBItemNotFoundError: If the task does not exist.
        """
        if id in self.tasks:
            del self.tasks[id]
        else:
            raise DBItemNotFoundError("Task not found")
{}


class DBConnection(ABC):
    """
    The Creator class declares the factory method that is supposed to return an
    object of a Product class. The Creator's subclasses usually provide the
    implementation of this method.
    """

    @abstractmethod
    def factory_method(self) -> DB:
        """
        Note that the Creator may also provide some default implementation of
        the factory method.
        """
        pass

    def connect(self) -> DB:
        """
        Also note that, despite its name, the Creator's primary responsibility
        is not creating products. Usually, it contains some core business logic
        that relies on Product objects, returned by the factory method.
        Subclasses can indirectly change that business logic by overriding the
        factory method and returning a different type of product from it.
        """

        # Call the factory method to create a Product object.
        db = self.factory_method()
        return db


"""
Concrete Creators override the factory method in order to change the resulting
product's type.
"""


class MongoDBConnection(DBConnection):
    """
    Note that the signature of the method still uses the abstract product type,
    even though the concrete product is actually returned from the method. This
    way the Creator can stay independent of concrete product classes.
    """

    def __init__(self, connection_uri):
        self.connection_uri = connection_uri

    def factory_method(self) -> DB:
        mongo_client = MongoClient(self.connection_uri)
        return MongoDB(mongo_client)


class MockDBConnection(DBConnection):
    def factory_method(self) -> DB:
        return MockDB()
