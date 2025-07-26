import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaHourglassHalf, FaClock } from 'react-icons/fa';
import { getTasks } from '../features/tasks/taskSlice';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [userTasks, setUserTasks] = useState([]);

  useEffect(() => {
    // Fetch all tasks
    dispatch(getTasks());
  }, [dispatch]);

  // Filter tasks for the current user
  useEffect(() => {
    if (user && tasks.length > 0) {
      const filteredTasks = tasks.filter(task => task.assignedTo?._id === user._id || task.assignedTo === user._id);
      setUserTasks(filteredTasks);
    }
  }, [tasks, user]);

  // Calculate task statistics for user tasks
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = userTasks.filter(task => task.status === 'pending').length;

  // Tasks due soon (in the next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const dueSoonTasks = userTasks
    .filter(task => {
      const dueDate = new Date(task.dueDate);
      return task.status !== 'completed' && dueDate >= today && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Welcome, {user?.name || user?.email}!</h2>
        <p className="text-gray-600">
          Here's an overview of your assigned tasks and their current status.
        </p>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center p-4 bg-blue-50 border-l-4 border-blue-500">
          <FaTasks className="text-blue-500 mr-4 text-2xl" />
          <div>
            <p className="text-sm text-gray-500">My Tasks</p>
            <p className="text-xl font-semibold">{isLoading ? '...' : totalTasks}</p>
          </div>
        </div>
        
        <div className="card flex items-center p-4 bg-green-50 border-l-4 border-green-500">
          <FaCheckCircle className="text-green-500 mr-4 text-2xl" />
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-xl font-semibold">{isLoading ? '...' : completedTasks}</p>
          </div>
        </div>
        
        <div className="card flex items-center p-4 bg-yellow-50 border-l-4 border-yellow-500">
          <FaHourglassHalf className="text-yellow-500 mr-4 text-2xl" />
          <div>
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-xl font-semibold">{isLoading ? '...' : inProgressTasks}</p>
          </div>
        </div>
        
        <div className="card flex items-center p-4 bg-red-50 border-l-4 border-red-500">
          <FaClock className="text-red-500 mr-4 text-2xl" />
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-xl font-semibold">{isLoading ? '...' : pendingTasks}</p>
          </div>
        </div>
      </div>

      {/* Tasks Due Soon */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Tasks Due Soon</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : dueSoonTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks due in the next 7 days.</p>
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
                {dueSoonTasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
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

      {/* All My Tasks */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All My Tasks</h2>
          <Link to="/my-tasks" className="text-primary-600 hover:text-primary-900 text-sm">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : userTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You don't have any tasks assigned.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userTasks.slice(0, 5).map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
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

export default UserDashboard; 