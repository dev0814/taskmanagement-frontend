import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaSort, FaSearch, FaFilter, FaTrash, FaEdit, FaUserAlt } from 'react-icons/fa';
import { getAllUsers, deleteUser } from '../../features/users/userSlice';
import { toast } from 'react-toastify';

const UserList = () => {
  const dispatch = useDispatch();
  const { users, pagination, isLoading } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    role: '',
    search: '',
  });
  
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'email',
    sortDir: 'asc',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Check if user is admin, otherwise redirect
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      // Redirect logic would typically be here
    }
  }, [user]);
  
  // Fetch users when filters, sorting, or pagination changes
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      ...filters,
      ...sortConfig,
    };
    
    dispatch(getAllUsers(params));
  }, [dispatch, currentPage, filters, sortConfig]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle sort changes
  const handleSort = (field) => {
    setSortConfig(prev => ({
      sortBy: field,
      sortDir: prev.sortBy === field && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1); // Reset to first page when sorting changes
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle user deletion
  const handleDeleteUser = (id) => {
    // Prevent deleting your own account
    if (id === user._id) {
      toast.error('You cannot delete your own account');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      dispatch(deleteUser(id))
        .unwrap()
        .then(() => {
          toast.success('User deleted successfully');
        })
        .catch((err) => {
          toast.error(err || 'Failed to delete user');
        });
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: '',
      search: '',
    });
    setCurrentPage(1);
  };
  
  // Pagination controls
  const totalPages = pagination?.pages || 1;
  
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center"
          >
            <FaFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <Link to="/users/create" className="btn btn-primary">
            Create User
          </Link>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className={`card ${showFilters ? 'block' : 'hidden'}`}>
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search users..."
              className="form-input rounded-r-none flex-grow"
            />
            <button type="submit" className="btn btn-primary rounded-l-none">
              <FaSearch />
            </button>
          </div>
        </form>
        
        <div className="flex flex-wrap gap-4">
          {/* Role filter */}
          <div className="w-full sm:w-auto">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="mt-auto ml-auto">
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Users table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <FaSort className="ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <FaSort className="ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      Role
                      <FaSort className="ml-1" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created At
                      <FaSort className="ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/users/${userItem._id}`} className="text-primary-600 hover:text-primary-900 font-medium">
                        {userItem.email}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userItem.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/users/${userItem._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <FaEdit className="inline" /> Edit
                      </Link>
                      {userItem._id !== user._id && (
                        <button
                          onClick={() => handleDeleteUser(userItem._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="inline" /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!isLoading && users.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === currentPage ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList; 