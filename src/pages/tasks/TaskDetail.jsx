import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTaskById } from '../../features/tasks/taskSlice';
import { FaEdit, FaArrowLeft, FaCheck, FaSpinner, FaClock, FaUser, FaCalendarAlt, FaExclamationCircle, FaFilePdf, FaDownload, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import UpdateStatusModal from '../../components/tasks/UpdateStatusModal';
import PDFViewerModal from '../../components/tasks/PDFViewerModal';

const TaskDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { task, isLoading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  
  // Local UI state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  useEffect(() => {
    dispatch(getTaskById(id));
  }, [dispatch, id]);

  const handleDownloadDocument = (docId, filename) => {
    const token = localStorage.getItem('token');
    const downloadUrl = `${api.defaults.baseURL}/tasks/${id}/documents/${docId}`;
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'document.pdf';
    a.target = '_blank';
    
    // Add the authorization header through a fetch request
    fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    });
  };

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setIsPdfModalOpen(true);
  };
  
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };
  
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Check if user can edit this task
  const canEditTask = () => {
    return user.role === 'admin' || (task && task.createdBy && task.createdBy._id === user._id);
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
        <p className="text-gray-500">Task not found or you don't have permission to view it.</p>
        <Link to="/tasks" className="btn btn-primary mt-4">
          Back to Tasks
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center">
        <Link 
          to="/tasks" 
          className="btn btn-secondary flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Tasks
        </Link>
        {canEditTask() && (
          <Link 
            to={`/tasks/${id}/edit`}
            className="btn btn-primary flex items-center"
          >
            <FaEdit className="mr-2" /> Edit Task
          </Link>
        )}
      </div>
      
      {/* Task header */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex mt-2 md:mt-0">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(task.status)} mr-2`}>
              {task.status}
            </span>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPriorityBadgeColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
        
        {/* Task metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <FaCalendarAlt className="mr-2 text-gray-400" />
            <span className="mr-1">Created:</span>
            <span>{task.createdAt ? formatDate(task.createdAt) : 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaUser className="mr-2 text-gray-400" />
            <span className="mr-1">Created by:</span>
            <span>{task.createdBy?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaClock className="mr-2 text-gray-400" />
            <span className="mr-1">Due date:</span>
            <span>{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaUser className="mr-2 text-gray-400" />
            <span className="mr-1">Assigned to:</span>
            <span>{task.assignedTo?.email || 'Unassigned'}</span>
          </div>
          {task.completedAt && (
            <div className="flex items-center text-sm text-gray-500">
              <FaCheck className="mr-2 text-green-500" />
              <span className="mr-1">Completed:</span>
              <span>{formatDate(task.completedAt)}</span>
            </div>
          )}
          {task.priority === 'high' && task.status !== 'completed' && (
            <div className="flex items-center text-sm text-red-500">
              <FaExclamationCircle className="mr-2" />
              <span>High priority task</span>
            </div>
          )}
        </div>
        
        {/* Task description */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-medium mb-2">Description</h2>
          <div className="prose max-w-none">
            {task.description ? (
              <div className="whitespace-pre-wrap">{task.description}</div>
            ) : (
              <p className="text-gray-500">No description provided</p>
            )}
          </div>
        </div>

        {/* Task note */}
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-medium mb-2">Status Note</h2>
          <div className="prose max-w-none">
            {task.note ? (
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200">
                {task.note}
              </div>
            ) : (
              <p className="text-gray-500">No status note available</p>
            )}
          </div>
        </div>
        
        {/* Documents section */}
        {task.documents && task.documents.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-lg font-medium mb-2">Documents</h2>
            <ul className="space-y-3">
              {task.documents.map((doc) => (
                <li key={doc._id} className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                  <FaFilePdf className="text-red-500 mr-2 text-xl flex-shrink-0" />
                  <div 
                    className="flex-grow overflow-hidden cursor-pointer hover:text-primary-600"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <p className="font-medium text-gray-700 truncate">{doc.originalName || doc.filename}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(doc.size)} • Added {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadDocument(doc._id, doc.originalName)}
                      className="flex items-center px-3 py-1 bg-primary-50 text-primary-600 rounded hover:bg-primary-100"
                      title="Download document"
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {task.documents.length === 3 && (
              <p className="text-xs text-gray-500 mt-2">
                Maximum of 3 documents attached (PDF format only)
              </p>
            )}
          </div>
        )}
        
        {/* Status update section */}
        {user._id === task.assignedTo?._id || user.role === 'admin' || task.createdBy?._id === user._id ? (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-lg font-medium mb-2">Update Status</h2>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="btn btn-primary"
            >
              Update Status
            </button>
          </div>
        ) : null}
      </div>

      {/* Status Update Modal */}
      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        task={task}
      />

      {/* PDF Viewer Modal */}
      {selectedDoc && (
        <PDFViewerModal
          isOpen={isPdfModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            setSelectedDoc(null);
          }}
          docId={selectedDoc._id}
          taskId={id}
          filename={selectedDoc.originalName || selectedDoc.filename}
        />
      )}
    </div>
  );
};

export default TaskDetail; 