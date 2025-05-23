import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaHourglassHalf, FaClock, FaUsers } from 'react-icons/fa';
import { getTasks } from '../features/tasks/taskSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch]);

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;

  // Filter tasks for the upcoming tasks section (pending or in-progress, due soon)
  const upcomingTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <Link to="/tasks/create" className="btn btn-primary">
          Create New Task
        </Link>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center p-4 bg-blue-50 border-l-4 border-blue-500">
          <FaTasks className="text-blue-500 mr-4 text-2xl" />
          <div>
            <p className="text-sm text-gray-500">Total Tasks</p>
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

      {/* Upcoming Tasks */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No upcoming tasks found.</p>
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
                {upcomingTasks.map((task) => (
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
                      <Link to={`/tasks/${task._id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        View
                      </Link>
                      <Link to={`/tasks/${task._id}/edit`} className="text-primary-600 hover:text-primary-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Admin Quick Links */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/tasks" className="card p-4 bg-blue-50 hover:bg-blue-100 flex items-center">
            <FaTasks className="text-blue-500 mr-4 text-xl" />
            <div>
              <div className="font-medium">Manage Tasks</div>
              <div className="text-sm text-gray-600">View, create, edit, and delete tasks</div>
            </div>
          </Link>
          
          <Link to="/users" className="card p-4 bg-purple-50 hover:bg-purple-100 flex items-center">
            <FaUsers className="text-purple-500 mr-4 text-xl" />
            <div>
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-gray-600">View, create, edit, and delete users</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 