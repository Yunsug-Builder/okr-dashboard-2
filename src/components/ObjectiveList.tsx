import React from 'react';
import type { Objective, KeyResult, ActionItem, ModalType } from '../types';
import { Trash2, ChevronDown, ChevronRight, Edit } from 'lucide-react';

interface ObjectiveListProps {
  objectives: Objective[];
  onAdd: (type: ModalType, objId?: string | null, krId?: string | null) => void;
  onEdit: (type: ModalType, item: Objective | KeyResult | ActionItem, objectiveId?: string, keyResultId?: string) => void;
  onDeleteObjective: (id: string) => void;
  onDeleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  onToggleActionItemCompletion: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  onDeleteActionItem: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  onToggleObjectiveOpen: (id: string) => void;
  onToggleKeyResultOpen: (objectiveId: string, keyResultId: string) => void;
}

const ObjectiveList: React.FC<ObjectiveListProps> = ({
  objectives,
  onAdd,
  onEdit,
  onDeleteObjective,
  onDeleteKeyResult,
  onToggleActionItemCompletion,
  onDeleteActionItem,
  onToggleObjectiveOpen,
  onToggleKeyResultOpen,
}) => {

  const getDueDateDisplay = (dueDate: string | null) => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dateText = '';
    let textColorClass = 'text-gray-400';

    if (diffDays < 0) {
      dateText = `Overdue`;
      textColorClass = 'text-red-400';
    } else if (diffDays === 0) {
      dateText = 'Today';
      textColorClass = 'text-red-400';
    } else if (diffDays > 0) {
      dateText = `D-${diffDays}`;
    }

    return (
      <span className={`text-xs ml-2 font-medium ${textColorClass}`} title={dueDate}>
        {dueDate} ({dateText})
      </span>
    );
  };

  const renderActionItems = (actionItems: ActionItem[], objectiveId: string, keyResultId: string) => (
    <ul className="pl-8 pr-4 py-2 space-y-2">
      {actionItems.map(action => (
        <li key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/60 shadow-inner">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={action.isCompleted}
              onChange={() => onToggleActionItemCompletion(objectiveId, keyResultId, action.id)}
              className="form-checkbox h-5 w-5 text-purple-500 bg-gray-900 border-gray-700 rounded-sm focus:ring-purple-500/50 focus:ring-offset-gray-900"
            />
            <span className={`text-base ${action.isCompleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>
              {action.title}
            </span>
            {getDueDateDisplay(action.dueDate)}
          </div>
          <div className="flex items-center gap-4 opacity-70">
            <Edit
              size={18}
              className="cursor-pointer text-gray-400 hover:text-purple-400 transition-colors"
              onClick={() => onEdit('ACTION_ITEM', action, objectiveId, keyResultId)}
            />
            <Trash2
              size={18}
              className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
              onClick={() => onDeleteActionItem(objectiveId, keyResultId, action.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  );

  const renderKeyResults = (keyResults: KeyResult[], objective: Objective) => (
    <div className="pl-8 pr-4 pb-2 space-y-3">
      {keyResults.map(kr => (
        <div key={kr.id} className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden">
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            onClick={() => onToggleKeyResultOpen(objective.id, kr.id)}
          >
            <div className="flex items-center gap-3">
              {kr.isOpen ? <ChevronDown size={20} className="text-purple-400" /> : <ChevronRight size={20} className="text-purple-400" />}
              <h3 className="text-lg font-semibold text-purple-300">{kr.title}</h3>
              {getDueDateDisplay(kr.dueDate)}
            </div>
            <div className="flex items-center gap-4 opacity-80">
              <button
                className="text-xs bg-purple-600/50 hover:bg-purple-600/80 text-white font-bold py-1 px-3 rounded-full transition-all"
                onClick={(e) => { e.stopPropagation(); onAdd('ACTION_ITEM', objective.id, kr.id); }}
              >
                Add Action
              </button>
              <Edit
                size={20}
                className="cursor-pointer text-gray-300 hover:text-purple-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); onEdit('KEY_RESULT', kr, objective.id); }}
              />
              <Trash2
                size={20}
                className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); onDeleteKeyResult(objective.id, kr.id); }}
              />
            </div>
          </div>
          {kr.isOpen && renderActionItems(kr.actionItems, objective.id, kr.id)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {objectives.map(objective => (
        <div key={objective.id} className="bg-gray-900/70 border border-gray-800/50 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden">
          <div
            className="p-5 flex items-center justify-between cursor-pointer"
            onClick={() => onToggleObjectiveOpen(objective.id)}
          >
            <div className="flex items-center gap-4">
              {objective.isOpen ? <ChevronDown size={24} className="text-teal-400" /> : <ChevronRight size={24} className="text-teal-400" />}
              <h2 className="text-xl font-bold tracking-wide text-teal-300">{objective.title}</h2>
              {getDueDateDisplay(objective.dueDate)}
            </div>
            <div className="flex items-center gap-4 opacity-80">
              <button
                className="text-sm bg-teal-600/50 hover:bg-teal-600/80 text-white font-bold py-2 px-4 rounded-full transition-all"
                onClick={(e) => { e.stopPropagation(); onAdd('KEY_RESULT', objective.id); }}
              >
                Add Key Result
              </button>
              <Edit
                size={22}
                className="cursor-pointer text-gray-300 hover:text-teal-400 transition-colors"
                onClick={(e) => { e.stopPropagation(); onEdit('OBJECTIVE', objective); }}
              />
              <Trash2
                size={22}
                className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors"
                onClick={(e) => { e.stopPropagation(); onDeleteObjective(objective.id); }}
              />
            </div>
          </div>
          {objective.isOpen && renderKeyResults(objective.keyResults, objective)}
        </div>
      ))}
    </div>
  );
};

export default ObjectiveList;
