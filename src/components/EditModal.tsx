import React, { useState, useEffect } from 'react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, startDate: string, dueDate: string) => void;
  modalTitle: string;
  initialTitle?: string;
  initialDueDate?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  modalTitle,
  initialTitle = '',
  initialDueDate = '',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [dueDate, setDueDate] = useState(initialDueDate);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDueDate(initialDueDate);
    }
  }, [initialTitle, initialDueDate, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    // Passing an empty string for startDate as it's not in the UI,
    // but the required signature is (title, startDate, dueDate)
    onSave(title, '', dueDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">{modalTitle}</h2>
        <div className="mb-4">
          <label htmlFor="itemTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="itemTitle"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label htmlFor="itemDueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
          <input
            type="date"
            id="itemDueDate"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
