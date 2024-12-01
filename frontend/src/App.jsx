import React, { useState, useEffect } from 'react';
import { connectToWebSocket } from './websocket';

import TaskSorter from './TaskSorter';
import SortByTitle from './strategies/SortByTitle';
import SortByStatus from './strategies/SortByStatus';

const API_URL = "http://localhost:9000/api/tasks";

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
  const [currentSortStrategy, setCurrentSortStrategy] = useState(''); // state for sorting strategy

  const taskSorter = new TaskSorter(); // Create TaskSorter instance

  // Fetch tasks from the backend
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

  // Handle sorting change
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
      default:
        taskSorter.setStrategy(null);
        break;
    }

    const sortedTasks = taskSorter.sort(tasks);
    setTasks(sortedTasks);
  };

  // Add a new task
  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert("Title is required!");
      document.getElementById("title-input").focus();
      return;
    }
    if (!newTask.description.trim()) {
      alert("Description is required!");
      document.getElementById("description-input").focus();
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error("Failed to add task");
      }
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

  // Update an existing task
  const handleUpdateTask = async (id) => {
    if (!newTask.title.trim()) {
      alert("Title is required!");
      document.getElementById("title-input").focus();
      return;
    }
    if (!newTask.description.trim()) {
      alert("Description is required!");
      document.getElementById("description-input").focus();
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
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

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setHistory([...history, tasks]);
      setRedoStack([]);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setRedoStack([tasks, ...redoStack]);
      setTasks(lastState);
      setHistory(history.slice(0, -1));
      console.log("Undo successful");
    } else {
      console.log("No actions to undo");
    }
  };

  // Redo last undone action
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setHistory([...history, tasks]);
      setTasks(nextState);
      setRedoStack(redoStack.slice(1));
      console.log("Redo successful");
    } else {
      console.log("No actions to redo");
    }
  };

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
          <option value="">Select Sorting Option</option>
          <option value="title">Title</option>
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
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.task.title}</td>
              <td>{task.task.description}</td>
              <td>{task.task.assigned_user_id}</td>
              <td>{task.task.status}</td>
              <td>
                <button onClick={() => {
                  setNewTask({
                    title: task.task.title,
                    description: task.task.description,
                    assigned_user_id: task.task.assigned_user_id,
                    status: task.task.status,
                  });
                  setEditTaskId(task.id);
                }}>
                  Edit
                </button>
                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '20px' }}>
        <h2>{editTaskId ? "Edit Task" : "Add Task"}</h2>
        <label>
          Title:
          <input
            id="title-input"
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
        </label>
        <br />
        <label>
          Description:
          <input
            id="description-input"
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
