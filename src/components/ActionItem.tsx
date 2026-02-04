import React from 'react';
import type { ActionItem } from '../types';
import { Trash2 } from 'lucide-react';

interface ActionItemProps {
  actionItem: ActionItem;
  objectiveId: string;
  keyResultId: string;
  toggleActionItemCompletion: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  deleteActionItem: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
}

const ActionItemComponent: React.FC<ActionItemProps> = ({
  actionItem,
  objectiveId,
  keyResultId,
  toggleActionItemCompletion,
  deleteActionItem,
}) => {
  return (
    <li className="flex items-center justify-between text-sm text-gray-700">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={actionItem.isCompleted}
          onChange={() => toggleActionItemCompletion(objectiveId, keyResultId, actionItem.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3"
        />
        <span className={actionItem.isCompleted ? 'line-through text-gray-400' : ''}>
          {actionItem.title}
        </span>
      </div>
      <button
        onClick={() => deleteActionItem(objectiveId, keyResultId, actionItem.id)}
        className="text-gray-400 hover:text-red-500 focus:outline-none ml-2"
        aria-label="Delete Action Item"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
};

export default ActionItemComponent;
