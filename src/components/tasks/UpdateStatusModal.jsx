import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { updateTaskStatus } from '../../features/tasks/taskSlice';
import { toast } from 'react-toastify';
import './UpdateStatusModal.css';

const UpdateStatusModal = ({ isOpen, onClose, task }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    status: task?.status || 'pending',
    note: task?.note || ''
  });
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (task) {
      setFormData({
        status: task.status,
        note: task.note || ''
      });
    }
  }, [task]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.note.trim()) {
      setError('Note is required');
      return;
    }
    
    try {
      await dispatch(updateTaskStatus({
        id: task._id,
        status: formData.status,
        note: formData.note
      })).unwrap();
      
      toast.success('Task status updated successfully');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update task status');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="update-status-modal-overlay">
      <div className="update-status-modal-container">
        <div className="update-status-modal-header">
          <h2 className="update-status-modal-title">Update Task Status</h2>
          <button
            onClick={onClose}
            className="update-status-modal-close"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="update-status-modal-form">
          <div className="update-status-modal-form-group">
            <label htmlFor="status" className="update-status-modal-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="update-status-modal-select"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="update-status-modal-form-group">
            <label htmlFor="note" className="update-status-modal-label">
              Note
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              className="update-status-modal-textarea"
              placeholder="Enter a note about the status update..."
              required
            />
            {error && <p className="update-status-modal-error">{error}</p>}
          </div>
          
          <div className="update-status-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="update-status-modal-btn update-status-modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="update-status-modal-btn update-status-modal-btn-submit"
              disabled={!formData.note.trim()}
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal; 