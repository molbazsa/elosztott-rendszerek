from pydantic import BaseModel
from typing import Any

# https://github.com/pydantic/pydantic/discussions/3089#discussioncomment-8052305
class PartialModel(BaseModel):
    @classmethod
    def __pydantic_init_subclass__(cls, **kwargs: Any) -> None:
        super().__pydantic_init_subclass__(**kwargs)

        for field in cls.model_fields.values():
            field.default = None

        cls.model_rebuild(force=True)
