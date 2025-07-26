import React from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaEnvelope, FaBook, FaUserCircle } from 'react-icons/fa';

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Help Center</h1>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <a href="mailto:support@taskmanager.com" className="card p-4 hover:bg-gray-50">
          <FaEnvelope className="text-primary-500 text-2xl mb-2" />
          <h3 className="font-semibold">Contact Support</h3>
          <p className="text-sm text-gray-600">Get help from our team</p>
        </a>
        
      </div>

      {/* FAQs */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-2">How do I Update Status of task?</h3>
            <p className="text-gray-600">
              To Update Status of a task, click on the "Update Status" button in the "View Details" page.
            </p>
          </div>


        </div>
      </div>


    </div>
  );
};

export default Help; 