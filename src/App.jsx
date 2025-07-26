import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Page Components
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import TaskList from './pages/tasks/TaskList';
import TaskDetail from './pages/tasks/TaskDetail';
import CreateTask from './pages/tasks/CreateTask';
import EditTask from './pages/tasks/EditTask';
import MyTasks from './pages/tasks/MyTasks';
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';
import CreateUser from './pages/users/CreateUser';
import EditUser from './pages/users/EditUser';
import Profile from './pages/Profile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

// Redux
import { getUserProfile } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (localStorage.getItem('token') && !user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, user]);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {isAuthenticated ? (
        <div className="flex flex-col min-h-screen">
          <Header />
          
          <div className="flex flex-1">
            <Sidebar />
            
            <main className="flex-1 bg-gray-50 p-6">
              <Routes>
                {/* Dashboard - accessible to all users */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                {/* User routes */}
                <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                
                {/* Tasks - Admin only */}
                <Route path="/tasks" element={<AdminRoute><TaskList /></AdminRoute>} />
                <Route path="/tasks/create" element={<AdminRoute><CreateTask /></AdminRoute>} />
                <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
                <Route path="/tasks/:id/edit" element={<AdminRoute><EditTask /></AdminRoute>} />
                
                {/* Users - Admin only */}
                <Route path="/users" element={<AdminRoute><UserList /></AdminRoute>} />
                <Route path="/users/create" element={<AdminRoute><CreateUser /></AdminRoute>} />
                <Route path="/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
                <Route path="/users/:id/edit" element={<AdminRoute><EditUser /></AdminRoute>} />
                
                {/* Profile */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                {/* Public pages */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/help" element={<Help />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          
          <Footer />
        </div>
      ) : (
        <div className="bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;
