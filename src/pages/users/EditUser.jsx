import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { getUserById, updateUser } from '../../features/users/userSlice';
import { toast } from 'react-toastify';

const EditUser = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { singleUser, isLoading } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load user data
  useEffect(() => {
    dispatch(getUserById(id));
  }, [dispatch, id]);
  
  // Populate form when user data is loaded
  useEffect(() => {
    if (singleUser) {
      setFormData({
        name: singleUser.name || '',
        email: singleUser.email || '',
        password: '',
        confirmPassword: '',
        role: singleUser.role || 'user',
      });
    }
  }, [singleUser]);
  
  // Check if user has permission to edit (admin can edit any user, user can only edit themselves)
  useEffect(() => {
    if (user && user.role !== 'admin' && user._id !== id) {
      toast.error('You do not have permission to edit this user');
      navigate('/');
    }
  }, [user, id, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Check password length if provided
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // Prevent non-admin users from changing their role
    if (user.role !== 'admin' && formData.role !== singleUser.role) {
      toast.error('You do not have permission to change roles');
      setFormData(prev => ({ ...prev, role: singleUser.role }));
      return;
    }
    
    // Prepare update data (exclude empty password)
    const updateData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    
    // Only include password if provided
    if (formData.password) {
      updateData.password = formData.password;
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(updateUser({ id, userData: updateData })).unwrap();
      toast.success('User updated successfully');
      
      // Navigate to appropriate location
      if (user.role === 'admin' && user._id !== id) {
        navigate(`/users/${id}`);
      } else {
        navigate('/profile'); // Redirect to profile if editing own account
      }
    } catch (error) {
      toast.error(error || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
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
        <p className="text-gray-500">User not found or you don't have permission to edit them.</p>
        <Link to="/" className="btn btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link 
          to={user.role === 'admin' && user._id !== id ? `/users/${id}` : '/profile'} 
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> 
          {user.role === 'admin' && user._id !== id ? 'Back to User' : 'Back to Profile'}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
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
          
          {/* Password (optional for edit) */}
          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter new password (leave blank to keep current)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave blank to keep the current password. New password must be at least 6 characters.
            </p>
          </div>
          
          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Confirm new password"
            />
          </div>
          
          {/* Role (only admin can change) */}
          <div>
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-input"
              disabled={user.role !== 'admin'}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {user.role === 'admin' && (
              <p className="mt-1 text-sm text-gray-500">
                <strong>Note:</strong> Admin users have full access to all features.
                Assign this role carefully.
              </p>
            )}
            {user.role !== 'admin' && (
              <p className="mt-1 text-sm text-gray-500">
                Only administrators can change user roles.
              </p>
            )}
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUser; 