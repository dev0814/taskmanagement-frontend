import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaFilter, FaSearch, FaSpinner } from 'react-icons/fa';
import { getTasks } from '../../features/tasks/taskSlice';

const MyTasks = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [userTasks, setUserTasks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtering state
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    startDate: '',
    endDate: '',
  });
  
  // Fetch all tasks
  useEffect(() => {
    if (user) {
      dispatch(getTasks());
    }
  }, [dispatch, user]);
  
  // Filter tasks for the current user
  useEffect(() => {
    if (user && tasks) {
      // Check if tasks is an array before filtering
      const tasksArray = Array.isArray(tasks) ? tasks : [];
      
      if (tasksArray.length > 0) {
        const filteredTasks = tasksArray.filter(task => 
          (task.assignedTo?._id === user._id) || 
          (task.assignedTo === user._id) ||
          (typeof task.assignedTo === 'string' && task.assignedTo === user._id)
        );
        setUserTasks(filteredTasks);
      } else {
        // If no tasks are loaded, fetch them
        dispatch(getTasks());
      }
    }
  }, [tasks, user, dispatch]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters to tasks
  const filteredTasks = userTasks.filter(task => {
    // Status filter
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (taskDate < startDate) {
        return false;
      }
    }
    
    if (filters.endDate && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (taskDate > endDate) {
        return false;
      }
    }
    
    // Search filter (case insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description && task.description.toLowerCase().includes(searchLower);
      if (!titleMatch && !descriptionMatch) {
        return false;
      }
    }
    
    return true;
  });
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      startDate: '',
      endDate: '',
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center"
          >
            <FaFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className={`card p-4 ${showFilters ? 'block' : 'hidden'}`}>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="form-label">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search tasks..."
                className="form-input pl-10"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          
          {/* Status filter */}
          <div>
            <label htmlFor="status" className="form-label">Status</label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {/* Priority filter */}
          <div>
            <label htmlFor="priority" className="form-label">Priority</label>
            <select
              id="priority"
              name="priority"
              className="form-input"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        {/* Date range filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Start Date */}
          <div className="md:w-1/2">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="form-input"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          {/* End Date */}
          <div className="md:w-1/2">
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="form-input"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Task list */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin h-8 w-8 mx-auto text-primary-500" />
            <p className="mt-2 text-gray-600">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No tasks found</div>
            <p className="text-gray-500">
              {userTasks.length === 0 
                ? "You don't have any tasks assigned to you yet." 
                : "No tasks match your current filters."}
            </p>
            {userTasks.length > 0 && filters.status + filters.priority + filters.search !== '' && (
              <button className="btn btn-primary mt-4" onClick={resetFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/tasks/${task._id}`} className="text-primary-600 hover:text-primary-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks; 