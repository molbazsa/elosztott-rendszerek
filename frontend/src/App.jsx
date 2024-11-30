import React, { useState, useEffect } from 'react';

import { connectToWebSocket } from './websocket';

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

  // Fetch tasks from the backend
  useEffect(() => {
    async function effect() {
      connectToWebSocket(async () => {
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks)
      });
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks)
    }
    effect();
  }, []);

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
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
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
