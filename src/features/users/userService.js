import axios from '../../api/axios';

// Get all users
const getAllUsers = async (params, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };

  const response = await axios.get('/users', config);
  console.log('getAllUsers response:', response.data);
  return response.data;
};

// Get user by id
const getUserById = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`/users/${userId}`, config);

  return response.data;
};

// Create new user (admin only)
const createUser = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post('/users', userData, config);

  return response.data;
};

// Update user
const updateUser = async (userId, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`/users/${userId}`, userData, config);

  return response.data;
};

// Delete user (admin only)
const deleteUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`/users/${userId}`, config);

  return response.data;
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default userService; 