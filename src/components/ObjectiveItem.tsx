import React from 'react';
import type { Objective } from '../types';
import KeyResultItem from './KeyResultItem';
import { ChevronDown, ChevronUp, Plus, Pencil, Trash2 } from 'lucide-react';

interface ObjectiveItemProps {
  objective: Objective;
  isObjectiveExpanded: boolean;
  toggleObjectiveExpansion: (objectiveId: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  handleObjectiveTitleChange: (objectiveId: string, newTitle: string) => void;
  deleteObjective: (id: string) => void;
  addKeyResult: (objectiveId: string) => void;
  expandedKeyResultIds: string[];
  toggleKeyResult: (keyResultId: string) => void;
  addActionItem: (objectiveId: string, keyResultId: string) => void;
  toggleActionItemCompletion: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  deleteKeyResult: (objectiveId: string, keyResultId: string) => void;
}

const ObjectiveItem: React.FC<ObjectiveItemProps> = ({
  objective,
  isObjectiveExpanded,
  toggleObjectiveExpansion,
  editingId,
  setEditingId,
  handleObjectiveTitleChange,
  deleteObjective,
  addKeyResult,
  expandedKeyResultIds,
  toggleKeyResult,
  addActionItem,
  toggleActionItemCompletion,
  deleteKeyResult,
}) => {
  const isCurrentlyEditing = editingId === objective.id;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(objective.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div key={objective.id}>
      {/* Objective Card */}
      <div
        className="bg-white rounded-xl p-4 shadow-sm mb-4 cursor-pointer transition-all hover:shadow-md"
        onClick={() => toggleObjectiveExpansion(objective.id)}
      >
        <div className="flex justify-between items-start mb-2">
          {isCurrentlyEditing ? (
            <input
              type="text"
              value={objective.title}
              onChange={(e) => handleObjectiveTitleChange(objective.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingId(null); // Save by exiting edit mode
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              onBlur={() => setEditingId(null)} // Save by exiting edit mode on blur
              className="text-xl font-bold p-1 border border-blue-300 rounded w-full"
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-bold">{objective.title}</h2>
          )}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditClick}
              className="text-gray-400 hover:text-blue-500 focus:outline-none"
              aria-label="Edit Objective"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteObjective(objective.id);
              }}
              className="text-gray-400 hover:text-red-500 focus:outline-none"
              aria-label="Delete Objective"
            >
              <Trash2 size={20} />
            </button>
            {isObjectiveExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${objective.progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{objective.progress}% Complete</p>
      </div>

      {/* Key Results List */}
      {isObjectiveExpanded && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {objective.keyResults.map((kr) => (
            <KeyResultItem
              key={kr.id}
              keyResult={kr}
              objectiveId={objective.id}
              isExpanded={expandedKeyResultIds.includes(kr.id)}
              toggleKeyResult={toggleKeyResult}
              addActionItem={addActionItem}
              toggleActionItemCompletion={toggleActionItemCompletion}
              deleteKeyResult={deleteKeyResult}
            />
          ))}

          {/* Add Key Result Button */}
          <button
            onClick={() => addKeyResult(objective.id)}
            className="mt-4 w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Plus size={16} />
            <span>Add Key Result</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ObjectiveItem;
