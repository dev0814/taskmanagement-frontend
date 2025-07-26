import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaUserAlt, FaEdit, FaCalendarAlt, FaEnvelope, FaIdCard, FaShieldAlt, FaClock } from 'react-icons/fa';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
  
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You need to be logged in to view your profile.</p>
        <Link to="/login" className="btn btn-primary mt-4">
          Login
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Link 
          to={`/users/${user._id}/edit`}
          className="btn btn-primary flex items-center"
        >
          <FaEdit className="mr-2" /> Edit Profile
        </Link>
      </div>
      
      {/* User profile card */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center mb-6">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <div className="bg-gray-200 rounded-full p-8">
              <FaUserAlt size={48} className="text-gray-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user.name || user.email}
            </h2>
            {user.name && (
              <p className="text-gray-500">{user.email}</p>
            )}
            <div className="mt-2">
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
        
        {/* User metadata */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <FaEnvelope className="mr-2 text-gray-400" />
              <span className="mr-1">Email:</span>
              <span>{user.email}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <FaCalendarAlt className="mr-2 text-gray-400" />
              <span className="mr-1">Joined:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            
            {user.name && (
              <div className="flex items-center text-sm text-gray-500">
                <FaIdCard className="mr-2 text-gray-400" />
                <span className="mr-1">Name:</span>
                <span>{user.name}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <FaShieldAlt className="mr-2 text-gray-400" />
              <span className="mr-1">Role:</span>
              <span>{user.role}</span>
            </div>
            
            {user.lastLogin && (
              <div className="flex items-center text-sm text-gray-500">
                <FaClock className="mr-2 text-gray-400" />
                <span className="mr-1">Last login:</span>
                <span>{formatDate(user.lastLogin)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 