import axios from '../../api/axios';

// Create new task
const createTask = async (taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post('/tasks', taskData, config);

  return response.data;
};

// Get all tasks
const getTasks = async (params, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };

  const response = await axios.get('/tasks', config);

  return response.data;
};

// Get task by id
const getTaskById = async (taskId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`/tasks/${taskId}`, config);

  return response.data;
};

// Update task
const updateTask = async (taskId, taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.put(`/tasks/${taskId}`, taskData, config);

  return response.data;
};

// Delete task
const deleteTask = async (taskId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`/tasks/${taskId}`, config);

  return response.data;
};

// Get user's tasks
const getUserTasks = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`/users/${userId}/tasks`, config);

  return response.data;
};

const taskService = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getUserTasks
};

export default taskService; 