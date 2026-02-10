import { useState } from 'react';

type EditModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (title: string, startDate: string, dueDate: string) => void;
  modalTitle: string;
  initialTitle?: string;
  initialStartDate?: string;
  initialDueDate?: string;
};

const EditModal = ({ 
  isOpen, 
  isSaving,
  onClose, 
  onSave, 
  modalTitle,
  initialTitle = '', 
  initialStartDate = '',
  initialDueDate = '' 
}: EditModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [dueDate, setDueDate] = useState(initialDueDate);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (title.trim()) {
      onSave(title, startDate, dueDate);
    } else {
      alert('Title cannot be empty.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{modalTitle}</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter a title"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
