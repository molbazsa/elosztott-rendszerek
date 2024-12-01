from commands.command import Command


class CommandManager:
    def __init__(self, db):
        self.undo_stack = []
        self.redo_stack = []
        self.db = db

    def execute_command(self, command: Command):
        result = command.execute(self.db)
        self.undo_stack.append(command)
        self.redo_stack.clear()  # Clear redo stack on new command
        return result

    def undo(self):
        if self.undo_stack:
            command = self.undo_stack.pop()
            command.undo(self.db)
            self.redo_stack.append(command)
        else:
            raise Exception("No commands to undo.")

    def redo(self):
        if self.redo_stack:
            command = self.redo_stack.pop()
            command.execute(self.db)
            self.undo_stack.append(command)
        else:
            raise Exception("No commands to redo.")
