import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { createUser } from '../../features/users/userSlice';
import { toast } from 'react-toastify';

const CreateUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  
  // Check if user is admin, otherwise redirect
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      
      await dispatch(createUser(userData)).unwrap();
      toast.success('User created successfully');
      navigate('/users');
    } catch (error) {
      toast.error(error || 'Failed to create user');
    }
  };
  
  // If not admin, don't render the page
  if (user && user.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You do not have permission to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link 
          to="/users" 
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
      </div>
      
      {/* User form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter user's name"
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">Email <span className="text-red-600">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter email address"
              required
            />
          </div>
          
          {/* Password */}
          <div>
            <label htmlFor="password" className="form-label">Password <span className="text-red-600">*</span></label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter password"
              required
            />
            <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters long.</p>
          </div>
          
          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-red-600">*</span></label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Confirm password"
              required
            />
          </div>
          
          {/* Role */}
          <div>
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              <strong>Note:</strong> Admin users have full access to all features.
              Assign this role carefully.
            </p>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUser; 