import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaExpand, FaCompress } from 'react-icons/fa';
import api from '../../api/axios';
import './PDFViewerModal.css';

const PDFViewerModal = ({ isOpen, onClose, docId, taskId, filename }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen && token) {
      // Create a blob URL for the PDF with authorization
      fetch(`${api.defaults.baseURL}/tasks/${taskId}/documents/${docId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF');
        setIsLoading(false);
      });
    }
  }, [isOpen, docId, taskId, token]);

  // Cleanup blob URL when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Handle full-screen change
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = filename || 'document.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleFullScreen = async () => {
    const modalElement = document.querySelector('.pdf-modal-container');
    if (!modalElement) return;

    try {
      if (!document.fullscreenElement) {
        await modalElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const nextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));
  const prevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="pdf-modal-overlay">
      <div className={`pdf-modal-container ${isFullScreen ? 'fullscreen' : ''}`}>
        {/* Header */}
        <div className="pdf-modal-header">
          <h2 className="pdf-modal-title">{filename}</h2>
          <div className="pdf-modal-actions">
            <button
              onClick={handleDownload}
              className="pdf-modal-btn pdf-modal-btn-secondary"
              disabled={!pdfUrl}
            >
              <FaDownload className="pdf-modal-btn-icon" /> Download
            </button>
            <button
              onClick={toggleFullScreen}
              className="pdf-modal-btn pdf-modal-btn-ghost"
              title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullScreen ? <FaCompress /> : <FaExpand />}
            </button>
            <button
              onClick={onClose}
              className="pdf-modal-btn pdf-modal-btn-ghost"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* PDF Controls */}
        <div className="pdf-modal-controls">
          <div className="pdf-modal-page-controls">
            <button
              onClick={prevPage}
              disabled={pageNumber <= 1}
              className="pdf-modal-btn pdf-modal-btn-ghost pdf-modal-btn-sm"
            >
              <FaChevronLeft />
            </button>
            <span>
              Page {pageNumber} of {numPages || '--'}
            </span>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="pdf-modal-btn pdf-modal-btn-ghost pdf-modal-btn-sm"
            >
              <FaChevronRight />
            </button>
          </div>
          <div className="pdf-modal-zoom-controls">
            <button
              onClick={zoomOut}
              className="pdf-modal-btn pdf-modal-btn-ghost pdf-modal-btn-sm"
            >
              <FaSearchMinus />
            </button>
            <span>{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              className="pdf-modal-btn pdf-modal-btn-ghost pdf-modal-btn-sm"
            >
              <FaSearchPlus />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="pdf-modal-content">
          {isLoading && (
            <div className="pdf-modal-loading">
              <div className="pdf-modal-loading-spinner"></div>
            </div>
          )}
          {error && (
            <div className="pdf-modal-error">
              {error}
            </div>
          )}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="pdf-modal-iframe"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal; 