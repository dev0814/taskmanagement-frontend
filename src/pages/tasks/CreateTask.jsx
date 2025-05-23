import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaFilePdf, FaExclamationCircle } from 'react-icons/fa';
import { createTask } from '../../features/tasks/taskSlice';
import { getAllUsers, getUsers } from '../../features/users/userSlice';
import { toast } from 'react-toastify';

const CreateTask = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.tasks);
  const { users = [] } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  const isAdmin = currentUser && currentUser.role === 'admin';
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    attachments: []
  });
  
  // File handling state
  const [fileInputs, setFileInputs] = useState([{ id: 1, file: null }]);
  
  // Load users for assignment dropdown
  useEffect(() => {
    if (isAdmin) {
      // Admin can see all users
      dispatch(getUsers());
    } else {
      // For regular users, show just themselves
      toast.info("Only admins can assign tasks to other users.");
      if (currentUser) {
        // Set current user as the only option
        setFormData(prev => ({
          ...prev,
          assignedTo: currentUser._id
        }));
      }
    }
  }, [dispatch, isAdmin, currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    
    // Check if file is a PDF
    if (file && file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = null; // Clear the input
      return;
    }
    
    // Add file to state
    setFileInputs(prevInputs => 
      prevInputs.map(input => 
        input.id === id ? { ...input, file } : input
      )
    );
    
    // Count how many files we have after this addition
    let filledInputs = fileInputs.filter(input => input.id !== id && input.file).length;
    if (file) filledInputs++; // Add this file if it exists
    
    // Add a new file input if we haven't reached the limit
    if (filledInputs < 3 && fileInputs.filter(input => input.file).length === fileInputs.length - 1) {
      setFileInputs(prev => [...prev, { id: Date.now(), file: null }]);
    }
    
    // Show a message if we've reached the limit
    if (filledInputs === 3) {
      toast.info('Maximum of 3 documents reached');
    }
  };
  
  const removeFile = (id) => {
    setFileInputs(prevInputs => prevInputs.filter(input => input.id !== id));
    
    // Add a new empty input if needed
    if (!fileInputs.some(input => input.file === null)) {
      setFileInputs(prev => [...prev, { id: Date.now(), file: null }]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    if (!formData.assignedTo) {
      toast.error('Please assign this task to a user');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }
    
    try {
      // Prepare form data with files
      const taskData = new FormData();
      
      // Add all required fields
      taskData.append('title', formData.title);
      taskData.append('description', formData.description || '');
      taskData.append('dueDate', formData.dueDate);
      taskData.append('priority', formData.priority);
      taskData.append('status', formData.status);
      taskData.append('assignedTo', formData.assignedTo);
      
      // Add files
      let fileCount = 0;
      fileInputs.forEach(input => {
        if (input.file) {
          taskData.append('documents', input.file);
          fileCount++;
        }
      });
      
      console.log(`Submitting task creation with ${fileCount} documents`);
      
      const result = await dispatch(createTask(taskData)).unwrap();
      toast.success('Task created successfully');
      navigate('/tasks');
    } catch (error) {
      console.error('Task creation error:', error);
      toast.error(typeof error === 'string' ? error : 'Failed to create task');
    }
  };
  
  // Count how many files we currently have
  const currentFileCount = fileInputs.filter(input => input.file).length;
  const canAddMoreFiles = currentFileCount < 3;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link 
          to="/tasks" 
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Tasks
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
      </div>
      
      {/* Task form */}
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* Task title */}
          <div>
            <label htmlFor="title" className="form-label">Title <span className="text-red-600">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter task title"
              required
            />
          </div>
          
          {/* Task description */}
          <div>
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              className="form-input"
              placeholder="Enter task description"
            />
          </div>
          
          {/* Task metadata - grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due date */}
            <div>
              <label htmlFor="dueDate" className="form-label">Due Date <span className="text-red-600">*</span></label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="form-label">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            {/* Assign to */}
            <div>
              <label htmlFor="assignedTo" className="form-label">Assign To <span className="text-red-600">*</span></label>
              {isAdmin ? (
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.email} {user.name ? `(${user.name})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={currentUser ? `${currentUser.email} (You)` : "Loading..."}
                  className="form-input"
                  disabled
                />
              )}
            </div>
          </div>
          
          {/* Documents */}
          <div>
            <div className="flex items-center mb-2">
              <label className="form-label m-0">Documents</label>
              <span className="ml-2 bg-gray-100 px-2 py-1 text-xs rounded text-gray-500">
                {currentFileCount}/3 uploaded
              </span>
            </div>
            
            {/* Display existing file inputs */}
            <div className="space-y-3 mb-2">
              {fileInputs.map((input) => (
                <div key={input.id} className="flex items-center">
                  {input.file ? (
                    <div className="flex-grow flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                      <FaFilePdf className="text-red-500 mr-2" />
                      <span className="text-sm text-gray-600 flex-grow truncate">
                        {input.file.name}
                      </span>
                      <button 
                        type="button"
                        onClick={() => removeFile(input.id)}
                        className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        &times;
                      </button>
                    </div>
                  ) : canAddMoreFiles ? (
                    <div className="w-full">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(input.id, e)}
                        className="form-input"
                        accept="application/pdf"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            
            <div className="flex items-center mt-2">
              <FaExclamationCircle className="text-gray-400 mr-2" />
              <p className="text-xs text-gray-500">
                Only PDF documents allowed. Maximum 3 files, 5MB per file.
              </p>
            </div>
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
                'Create Task'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTask; 