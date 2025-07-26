import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { FaTasks, FaCheckCircle, FaHourglassHalf, FaClock } from 'react-icons/fa';
import { getTasks } from '../features/tasks/taskSlice';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Render the appropriate dashboard based on user role
  const isAdmin = user && user.role === 'admin';
  
  useEffect(() => {
    if (isAdmin) {
      dispatch(getTasks());
    }
  }, [dispatch, isAdmin]);

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

  return isAdmin ? (
    <AdminDashboard />
  ) : (
    <UserDashboard />
  );
};

export default Dashboard; 