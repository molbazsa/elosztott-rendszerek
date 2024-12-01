import React, { useState, useEffect } from 'react';
import { connectToWebSocket } from './websocket';
import TaskSorter from './TaskSorter';
import { SortByTitle, SortByStatus, SortByAssignedUser } from './strategies';

const API_URL = "http://localhost:9000/api/tasks";

// Base Component for Task Rendering
class Task {
  constructor(task) {
    this.task = task;
  }

  render() {
    return {
      style: {},
    };
  }
}

// Decorator Base Class
class TaskDecorator extends Task {
  constructor(task) {
    super(task);
    this.task = task;
  }

  render() {
    return this.task.render();
  }
}

// Priority Task Decorator
class PriorityTaskDecorator extends TaskDecorator {
  render() {
    const baseRender = super.render();
    return {
      ...baseRender,
      style: { ...baseRender.style, border: '2px solid red' },
    };
  }
}

// Frozen Task Decorator
class FrozenTaskDecorator extends TaskDecorator {
  render() {
    const baseRender = super.render();
    return {
      ...baseRender,
      style: { ...baseRender.style, color: 'lightgrey' },
    };
  }
}

const fetchTasks = async (setTasks) => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_user_id: '',
    status: 'to_do',
  });
  const [editTaskId, setEditTaskId] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentSortStrategy, setCurrentSortStrategy] = useState('');

  const taskSorter = new TaskSorter();

  useEffect(() => {
    async function effect() {
      connectToWebSocket(async () => {
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
      });
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    }
    effect();
  }, []);

  const handleSortChange = (e) => {
    const strategy = e.target.value;
    setCurrentSortStrategy(strategy);

    switch (strategy) {
      case 'title':
        taskSorter.setStrategy(new SortByTitle());
        break;
      case 'status':
        taskSorter.setStrategy(new SortByStatus());
        break;
      case 'assigned_user':
        taskSorter.setStrategy(new SortByAssignedUser());
        break;
      default:
        taskSorter.setStrategy(null);
        break;
    }

    const sortedTasks = taskSorter.sort(tasks);
    setTasks(sortedTasks);
  };

  const decorateTask = (task) => {
    let decoratedTask = new Task(task);
    if (task.isPriority) {
      decoratedTask = new PriorityTaskDecorator(decoratedTask);
    }
    if (task.isFrozen) {
      decoratedTask = new FrozenTaskDecorator(decoratedTask);
    }
    return decoratedTask;
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert("Title and Description are required!");
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Failed to add task");

      const data = await response.json();
      setHistory([...history, tasks]);
      setRedoStack([]);
      setTasks([...tasks, data]);
      setNewTask({ title: '', description: '', assigned_user_id: '', status: 'to_do' });
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add the task. Please try again.");
    }
  };

  const handleUpdateTask = async (id) => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert("Title and Description are required!");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Failed to update task");

      const data = await response.json();
      setHistory([...history, tasks]);
      setRedoStack([]);
      setTasks(tasks.map((task) => (task.id === id ? data : task)));
      setNewTask({ title: '', description: '', assigned_user_id: '', status: 'to_do' });
      setEditTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update the task. Please try again.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete task");

      setHistory([...history, tasks]);
      setRedoStack([]);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setRedoStack([tasks, ...redoStack]);
      setTasks(lastState);
      setHistory(history.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setHistory([...history, tasks]);
      setTasks(nextState);
      setRedoStack(redoStack.slice(1));
    }
  };

  // Toggle task decoration (Priority/Frozen)
  const handleTogglePriority = (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, isPriority: !task.isPriority };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleToggleFrozen = (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, isFrozen: !task.isFrozen };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  function DecoratorButtons(task) {
    let priorityButton;
    let frozenButton;

    if (task.isFrozen) {
      priorityButton = <td></td>;
    } else {
      priorityButton = (
        <td>
          <button onClick={() => handleTogglePriority(task.id)} sytle={{ margin: "auto" }}>
            {task.isPriority ? 'Remove Priority' : 'Mark as Priority'}
          </button>
        </td>
      );
    }

    if (task.isPriority) {
      frozenButton = <td></td>;
    } else {
      frozenButton = (
        <td>
          <button onClick={() => handleToggleFrozen(task.id)} sytle={{ margin: "auto" }}>
            {task.isFrozen ? 'Unfreeze' : 'Freeze'}
          </button>
        </td>
      );
    }

    return (
      <>
        {priorityButton}
        {frozenButton}
      </>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>
      <div>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
      <div>
        <label>Sort By: </label>
        <select value={currentSortStrategy} onChange={handleSortChange}>
          <option value="title">Title</option>
          <option value="assigned_user">Assigned user</option>
          <option value="status">Status</option>
        </select>
      </div>
      <table border="1" style={{ width: '100%', textAlign: 'left', marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Assigned User</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Priority</th>
            <th>Frozen</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const decoratedTask = decorateTask(task);
            return (
              <tr key={task.id} style={decoratedTask.render().style}>
                <td>{task.id}</td>
                <td>{task.task.title}</td>
                <td>{task.task.description}</td>
                <td>{task.task.assigned_user_id}</td>
                <td>{task.task.status}</td>
                <td>
                  <button onClick={() => {
                    setNewTask({
                      title: task.title,
                      description: task.description,
                      assigned_user_id: task.assigned_user_id,
                      status: task.status,
                    });
                    setEditTaskId(task.id);
                  }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </td>
                {DecoratorButtons(task)}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: '20px' }}>
        <h2>{editTaskId ? "Edit Task" : "Add Task"}</h2>
        <label>
          Title:
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
        </label>
        <br />
        <label>
          Description:
          <input
            type="text"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
        </label>
        <br />
        <label>
          Assigned User ID:
          <input
            type="text"
            value={newTask.assigned_user_id}
            onChange={(e) => setNewTask({ ...newTask, assigned_user_id: e.target.value })}
          />
        </label>
        <br />
        <label>
          Status:
          <select
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          >
            <option value="to_do">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <br />
        {editTaskId ? (
          <button onClick={() => handleUpdateTask(editTaskId)}>Update Task</button>
        ) : (
          <button onClick={handleAddTask}>Add Task</button>
        )}
      </div>
    </div>
  );
}

export default App;
