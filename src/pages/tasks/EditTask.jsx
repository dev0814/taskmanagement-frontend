import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaFilePdf } from 'react-icons/fa';
import { getTaskById, updateTask } from '../../features/tasks/taskSlice';
import { getAllUsers } from '../../features/users/userSlice';
import { toast } from 'react-toastify';

const EditTask = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { task, isLoading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File handling state
  const [fileInputs, setFileInputs] = useState([{ id: 1, file: null }]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]); // Track removed files
  
  // Load task data and users
  useEffect(() => {
    dispatch(getTaskById(id));
    dispatch(getAllUsers());
  }, [dispatch, id]);
  
  // Populate form when task data is loaded
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        attachments: []
      });
      
      // Set existing files if any
      if (task.documents && task.documents.length > 0) {
        setExistingFiles(task.documents);
      }
    }
  }, [task]);
  
  // Check if user can edit this task
  const canEditTask = () => {
    return user && (user.role === 'admin' || (task && task.createdBy && task.createdBy._id === user._id));
  };
  
  // Redirect if user cannot edit this task
  useEffect(() => {
    if (task && !canEditTask()) {
      toast.error('You do not have permission to edit this task');
      navigate('/tasks');
    }
  }, [task, user, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    setFileInputs(prevInputs => 
      prevInputs.map(input => 
        input.id === id ? { ...input, file } : input
      )
    );
    
    // Add a new file input if all current inputs have files
    const allFilesFilled = fileInputs.every(input => input.file);
    if (allFilesFilled) {
      setFileInputs(prev => [...prev, { id: Date.now(), file: null }]);
    }
  };
  
  const handleRemoveExistingFile = (fileIndex) => {
    const fileToRemove = existingFiles[fileIndex];
    setRemovedFiles(prev => [...prev, fileToRemove]);
    setExistingFiles(prev => prev.filter((_, index) => index !== fileIndex));
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
    
    setIsSubmitting(true);
    try {
      // Prepare form data with files
      const taskData = new FormData();
      
      // Add all required fields
      taskData.append('title', formData.title);
      taskData.append('description', formData.description || '');  // Handle empty description
      taskData.append('dueDate', formData.dueDate);
      taskData.append('priority', formData.priority);
      taskData.append('status', formData.status);
      taskData.append('assignedTo', formData.assignedTo);
      
      // Add removed files information
      if (removedFiles.length > 0) {
        taskData.append('removedFiles', JSON.stringify(removedFiles.map(f => f._id)));
      }
      
      // Add files
      let fileCount = 0;
      fileInputs.forEach(input => {
        if (input.file) {
          taskData.append('documents', input.file);
          fileCount++;
        }
      });
      
      console.log(`Submitting task update with ${fileCount} new files and ${removedFiles.length} removed files`);
      
      await dispatch(updateTask({ id, taskData })).unwrap();
      toast.success('Task updated successfully');
      navigate(`/tasks/${id}`);
    } catch (error) {
      toast.error(error || 'Failed to update task');
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
  
  if (!task) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Task not found or you don't have permission to edit it.</p>
        <Link to="/tasks" className="btn btn-primary mt-4">
          Back to Tasks
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link 
          to={`/tasks/${id}`} 
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Task
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
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
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">-- Select User --</option>
                {users && users.length > 0 ? users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.email} {user.name ? `(${user.name})` : ''}
                  </option>
                )) : (
                  <option value="">Loading users...</option>
                )}
              </select>
            </div>
          </div>
          
          {/* Existing attachments */}
          {existingFiles.length > 0 && (
            <div>
              <label className="form-label">Current Attachments</label>
              <ul className="space-y-2 my-2">
                {existingFiles.map((file, index) => (
                  <li key={index} className="flex items-center p-2 bg-gray-50 rounded border border-gray-200">
                    <FaFilePdf className="text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {file.originalName || file.filename || 'File ' + (index + 1)}
                    </span>
                    <small className="ml-2 text-xs text-gray-500">
                      (PDF Document)
                    </small>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingFile(index)}
                      className="ml-auto text-red-500 hover:text-red-700 focus:outline-none"
                      title="Remove attachment"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                {existingFiles.length === 3 ? 
                  "Maximum number of documents (3) already attached." : 
                  `${existingFiles.length} of 3 allowed documents attached.`}
              </p>
            </div>
          )}
          
          {/* New attachments */}
          <div>
            <label className="form-label block mb-2">Add New Attachments</label>
            <div className="space-y-3">
              {fileInputs.map((input) => (
                <div key={input.id} className="flex items-center">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(input.id, e)}
                    className="form-input"
                    accept="application/pdf"  // Only allow PDF files
                  />
                  {input.file && (
                    <span className="ml-2 text-sm text-gray-600">
                      {input.file.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              You can attach up to 3 PDF documents. Max size: 5MB per file.
            </p>
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
                'Update Task'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTask; 