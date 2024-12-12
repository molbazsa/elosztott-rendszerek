import React, { useState, useEffect } from 'react';
import { TaskSubscriber } from './websocket';
import Task from './Task';
import { TaskPriorityDecorator, PriorityTask, FrozenTask } from './TaskPriority';
import TaskSorter from './TaskSorter';
import { TaskAnalyticsVisitor } from './TaskVisitor';
import { SortByTitle, SortByStatus, SortByAssignedUser } from './strategies';

const API_URL = "http://localhost:9000/api/tasks";

// Analytics Function
const generateAnalytics = (tasks) => {
  console.log("generating analytics");
  const visitor = new TaskAnalyticsVisitor();
  tasks.forEach((task) => {
    task.accept(visitor);
  });
  console.log(visitor.getAnalytics());
  return visitor.getAnalytics();
};

const fetchTasks = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    const tasks = await response.json();
    return tasks.map((taskJSON) => {
      return new Task(taskJSON);
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const sortingStrategies = {
  title: new SortByTitle(),
  assignedUser: new SortByAssignedUser(),
  status: new SortByStatus(),
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_user_id: '',
    status: 'to_do',
  });
  const [editTaskId, setEditTaskId] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [sortingType, setSortingType] = useState("title");
  const [taskSorter, setTaskSorter] = useState(
    new TaskSorter(sortingStrategies[sortingType])
  );

  useEffect(() => {
    setTaskSorter(new TaskSorter(sortingStrategies[sortingType]));
  }, [sortingType]);

  const handleSortChange = (event) => {
    const selectedSorting = event.target.value;
    setSortingType(selectedSorting);
  };

  useEffect(() => {
    async function effect() {
      const taskSubscriber = new TaskSubscriber(async () => {
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
      });
      taskSubscriber.subscribeWebsocket();
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    }

    effect();
  }, []);

  useEffect(() => {
    setAnalytics(generateAnalytics(tasks));
  }, [tasks]);

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
      setTasks([...tasks, new Task(data)]);
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
      const updatedTasks = (tasks.map((task) => (task.id === id ? new Task(data) : task)));
      setTasks(updatedTasks);
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
      const deletedTasks = tasks.filter((task) => task.id !== id);
      setTasks(deletedTasks);
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

  const handleTogglePriority = (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.fields.id === id) {
        if (task instanceof PriorityTask) {
          return task.undecorated();
        }

        if (task instanceof TaskPriorityDecorator) {
          return new PriorityTask(task.undecorated());
        }

        return new PriorityTask(task);
      }

      return task;
    });

    setTasks(updatedTasks);
  };

  const handleToggleFrozen = (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.fields.id === id) {
        if (task instanceof FrozenTask) {
          return task.undecorated();
        }

        if (task instanceof TaskPriorityDecorator) {
          return new FrozenTask(task.undecorated());
        }

        return new FrozenTask(task);
      }

      return task;
    });

    setTasks(updatedTasks);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>
      {analytics && <div>
        <h2>Analytics</h2>
        <p>Total Tasks: {analytics.taskCount}</p>
        <p>Priority Tasks: {analytics.priority.priorityCount}</p>
        <p>Frozen Tasks: {analytics.frozen.frozenCount}</p>
        <p>Tasks to do: {analytics.status.to_do}</p>
        <p>Tasks in progress: {analytics.status.in_progress}</p>
        <p>Tasks done: {analytics.status.done}</p>
      </div>}
      <div>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleRedo}>Redo</button>
      </div>
      <div>
        <label>Sort By: </label>
        <select value={sortingType} onChange={handleSortChange}>
          <option value="title">Title</option>
          <option value="assignedUser">Assigned user</option>
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
          {taskSorter.sort(tasks).map((task) => {
            return (
              <tr key={task.fields.id} style={task.render().style}>
                <td>{task.fields.id}</td>
                <td>{task.fields.title}</td>
                <td>{task.fields.description}</td>
                <td>{task.fields.assigned_user_id}</td>
                <td>{task.fields.status}</td>
                <td>
                  <button onClick={() => {
                    setNewTask({
                      title: task.fields.title,
                      description: task.fields.description,
                      assigned_user_id: task.fields.assigned_user_id,
                      status: task.fields.status,
                    });
                    setEditTaskId(task.fields.id);
                  }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTask(task.fields.id)}>Delete</button>
                </td>
                <td>
                  <button onClick={() => handleTogglePriority(task.fields.id)} style={{ margin: "auto" }}>
                    {task instanceof PriorityTask ? 'Remove Priority' : 'Mark as Priority'}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleToggleFrozen(task.fields.id)} style={{ margin: "auto" }}>
                    {task instanceof FrozenTask ? 'Unfreeze' : 'Freeze'}
                  </button>
                </td>
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
