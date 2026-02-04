import React from 'react';
import type { KeyResult } from '../types';
import ActionItemComponent from './ActionItem';
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from 'lucide-react';

interface KeyResultItemProps {
  keyResult: KeyResult;
  objectiveId: string;
  isExpanded: boolean;
  toggleKeyResult: (keyResultId: string) => void;
  addActionItem: (objectiveId: string, keyResultId: string) => void;
  toggleActionItemCompletion: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  deleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  // editKeyResult: (objectiveId: string, keyResultId: string) => void; // Assuming edit functionality for KR might be added later
}

const KeyResultItem: React.FC<KeyResultItemProps> = ({
  keyResult,
  objectiveId,
  isExpanded,
  toggleKeyResult,
  addActionItem,
  toggleActionItemCompletion,
  deleteKeyResult,
  // editKeyResult,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm transition-all">
      {/* Key Result Header */}
      <div
        className="flex justify-between items-start cursor-pointer"
        onClick={() => toggleKeyResult(keyResult.id)}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{keyResult.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{keyResult.progress}% Complete</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Assuming edit/delete for KeyResult might be added */}
          {/* <button
            onClick={(e) => { e.stopPropagation(); editKeyResult(objectiveId, keyResult.id); }}
            className="text-gray-400 hover:text-blue-500 focus:outline-none"
            aria-label="Edit Key Result"
          >
            <Pencil size={20} />
          </button> */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteKeyResult(objectiveId, keyResult.id);
            }}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
            aria-label="Delete Key Result"
          >
            <Trash2 size={20} />
          </button>
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {/* Action Items List */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <ul className="space-y-2">
            {keyResult.actionItems.map((ai) => (
              <ActionItemComponent
                key={ai.id}
                actionItem={ai}
                objectiveId={objectiveId}
                keyResultId={keyResult.id}
                toggleActionItemCompletion={toggleActionItemCompletion}
                deleteActionItem={(objectiveId, keyResultId, actionItemId) => {
                  deleteActionItem(objectiveId, keyResultId, actionItemId);
                }}
              />
            ))}
          </ul>
          {/* Add Action Item Button */}
          <button
            onClick={() => addActionItem(objectiveId, keyResult.id)}
            className="mt-4 w-full bg-green-100 text-green-800 py-2 px-4 rounded-md hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Action Item</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default KeyResultItem;
