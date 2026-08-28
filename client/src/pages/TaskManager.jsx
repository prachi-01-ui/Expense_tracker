import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const token = localStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, dueDate: dueDate || null }),
      });
      const data = await res.json();
      if (res.ok) {
        setTasks([data, ...tasks]);
        setTitle('');
        setDueDate('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = await res.json();
      if (res.ok) {
        setTasks(tasks.map((task) => (task._id === id ? updated : task)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks(tasks.filter((task) => task._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Task description..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition"
        >
          Add Task
        </button>
      </form>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-center py-6 text-sm">No tasks added yet.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="flex justify-between items-center p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-gray-300 transition"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleStatus(task._id)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span
                  className={`text-sm font-medium ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {task.dueDate && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManager;