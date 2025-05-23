import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserById } from '../../features/users/userSlice';
import { getUserTasks } from '../../features/tasks/taskSlice';
import { FaEdit, FaArrowLeft, FaUser, FaCalendarAlt, FaEnvelope, FaIdCard, FaShieldAlt, FaCheck, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UserDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { singleUser, isLoading } = useSelector((state) => state.users);
  const { tasks, isLoading: tasksLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  
  // Check if user has permission to view this page
  useEffect(() => {
    if (user && user.role !== 'admin' && user._id !== id) {
      toast.error('You do not have permission to view this page');
      navigate('/');
    }
  }, [user, id, navigate]);
  
  // Fetch user data and tasks
  useEffect(() => {
    dispatch(getUserById(id));
    dispatch(getUserTasks(id));
  }, [dispatch, id]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!singleUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">User not found or you don't have permission to view it.</p>
        <Link to="/" className="btn btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center">
        <Link 
          to={user.role === 'admin' ? "/users" : "/"} 
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> 
          {user.role === 'admin' ? 'Back to Users' : 'Back to Dashboard'}
        </Link>
        {(user.role === 'admin' || user._id === id) && (
          <Link 
            to={`/users/${id}/edit`}
            className="btn btn-primary flex items-center"
          >
            <FaEdit className="mr-2" /> Edit User
          </Link>
        )}
      </div>
      
      {/* User header */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center">
            <div className="bg-gray-200 rounded-full p-4 mr-4">
              <FaUser size={24} className="text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {singleUser.name || singleUser.email}
              </h1>
              {singleUser.name && (
                <p className="text-gray-500">{singleUser.email}</p>
              )}
            </div>
          </div>
          <div className="mt-2 md:mt-0">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getRoleBadgeColor(singleUser.role)}`}>
              {singleUser.role}
            </span>
          </div>
        </div>
        
        {/* User metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <FaEnvelope className="mr-2 text-gray-400" />
            <span className="mr-1">Email:</span>
            <span>{singleUser.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <span className="mr-1">Joined:</span>
            <span>{singleUser.createdAt ? formatDate(singleUser.createdAt) : 'N/A'}</span>
          </div>
          
          {singleUser.name && (
            <div className="flex items-center text-sm text-gray-500">
              <FaIdCard className="mr-2 text-gray-400" />
              <span className="mr-1">Name:</span>
              <span>{singleUser.name}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <FaShieldAlt className="mr-2 text-gray-400" />
            <span className="mr-1">Role:</span>
            <span>{singleUser.role}</span>
          </div>
          
          {singleUser.lastLogin && (
            <div className="flex items-center text-sm text-gray-500">
              <FaClock className="mr-2 text-gray-400" />
              <span className="mr-1">Last login:</span>
              <span>{formatDate(singleUser.lastLogin)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* User tasks */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">User Tasks</h2>
        
        {tasksLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No tasks found for this user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/tasks/${task._id}`} className="text-primary-600 hover:text-primary-900 font-medium">
                        {task.title}
                      </Link>
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
                      {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
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

export default UserDetail; 