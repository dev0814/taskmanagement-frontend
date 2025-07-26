import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import taskService from './taskService';

// Get all tasks with filtering, sorting, and pagination
export const getTasks = createAsyncThunk(
  'tasks/getTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        priority,
        assignedTo,
        startDate,
        endDate,
        search,
        sortBy,
        sortDir,
      } = params;
      
      const response = await api.get('/tasks', {
        params: {
          page,
          limit,
          status,
          priority,
          assignedTo,
          startDate,
          endDate,
          search,
          sortBy,
          sortDir,
        },
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

// Get task by ID
export const getTaskById = createAsyncThunk(
  'tasks/getTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch task'
      );
    }
  }
);

// Create new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue, getState }) => {
    try {
      // Get token from state
      const token = getState().auth.user.token;
      
      // If taskData is already FormData, use it directly
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      // Send the request
      const response = await api.post('/tasks', taskData, config);
      
      return response.data.data;
    } catch (error) {
      console.error('Create task error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue, getState }) => {
    try {
      // Get token from state
      const token = getState().auth.user.token;
      
      console.log('Task update - Starting update for task ID:', id);
      console.log('Task update - Auth token present:', !!token);
      console.log('Task update - Input taskData:', taskData);
      
      // FormData is already created in the EditTask component
      // No need to create a new one or transfer values
      
      // Log the final FormData entries
      console.log('Task update - FormData entries:');
      for (let pair of taskData.entries()) {
        console.log(`   ${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
      }
      
      console.log('Task update - Sending request to:', `/tasks/${id}`);
      const response = await api.put(`/tasks/${id}`, taskData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      
      console.log('Task update - Response status:', response.status);
      console.log('Task update - Response data:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Task update - Error:', error);
      console.error('Task update - Response data:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

// Get tasks for a specific user
export const getUserTasks = createAsyncThunk(
  'tasks/getUserTasks',
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await taskService.getUserTasks(userId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status, note }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.user.token;
      const response = await api.patch(
        `/tasks/${id}/status`,
        { status, note },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task status'
      );
    }
  }
);

// Initial state
const initialState = {
  tasks: [],
  task: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
  isSuccess: false,
  message: '',
};

// Create slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearSelectedTask: (state) => {
      state.task = null;
    },
    reset: (state) => {
      // Keep the tasks but reset other state
      const tasks = [...state.tasks];
      Object.assign(state, initialState);
      state.tasks = tasks;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all tasks
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get task by ID
      .addCase(getTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.task = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
        if (state.task && state.task._id === action.payload._id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
        if (state.task && state.task._id === action.payload) {
          state.task = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get tasks for a specific user
      .addCase(getUserTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(getUserTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update task status
      .addCase(updateTaskStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
        if (state.task && state.task._id === action.payload._id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTaskError, clearSelectedTask, reset } = taskSlice.actions;
export default taskSlice.reducer; 