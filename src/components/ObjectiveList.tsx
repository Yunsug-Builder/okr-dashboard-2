import React from 'react';
import type { Objective, KeyResult, ActionItem } from '../types';
import { Plus, Trash2, ChevronDown, ChevronRight, Edit } from 'lucide-react';

type ModalType = 'OBJECTIVE' | 'KEY_RESULT' | 'ACTION_ITEM' | null;

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

  const getDueDateDisplay = (dueDate?: string) => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Normalize due date to midnight

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days remaining/overdue

    let dateText = '';
    let textColorClass = 'text-gray-500'; // Default for future dates

    if (diffDays < 0) {
      dateText = `Overdue`;
      textColorClass = 'text-red-500';
    } else if (diffDays === 0) {
      dateText = 'Today';
      textColorClass = 'text-red-500';
    } else if (diffDays > 0) {
      dateText = `D-${diffDays}`;
      textColorClass = 'text-gray-500';
    }

    return (
      <span className={`text-xs ml-2 font-medium ${textColorClass}`} title={dueDate}>
        {dueDate} ({dateText})
      </span>
    );
  };

  return (
    <div>
      {objectives.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No objectives found. Add your first objective!</p>
      ) : (
        objectives.map((objective) => (
          <div key={objective.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                 {/* Objective Display/Edit */}
                  <div className="flex-grow flex items-center cursor-pointer" onClick={() => onToggleObjectiveOpen(objective.id)}>
                       {objective.isOpen ? <ChevronDown size={20} className="mr-2 text-gray-500"/> : <ChevronRight size={20} className="mr-2 text-gray-500"/>}
                       <h2 className="text-lg font-semibold text-gray-700">{objective.title}</h2>
                       {getDueDateDisplay(objective.dueDate)}
                   </div>
                   <div className="flex items-center">
                       <button onClick={(e) => {e.stopPropagation(); onEdit('OBJECTIVE', objective);}} className="text-gray-400 hover:text-blue-500 mr-2" aria-label="Edit Objective"><Edit size={16}/></button>
                       <button onClick={(e) => {e.stopPropagation(); onDeleteObjective(objective.id);}} className="text-gray-400 hover:text-red-500" aria-label="Delete Objective"><Trash2 size={16}/></button>
                   </div>
               </div>
               <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                 <div style={{ width: `${objective.progress}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-500"></div>
               </div>
               <div className="text-right text-sm text-gray-500 mt-1">{objective.progress}%</div>
             </div>

             {objective.isOpen && (
               <div className="p-4 bg-gray-50">
                 {objective.keyResults.map(kr => (
                   <div key={kr.id} className="mb-3 last:mb-0">
                     <div className="flex items-center justify-between">
                          <div className="flex-grow flex items-center cursor-pointer" onClick={() => onToggleKeyResultOpen(objective.id, kr.id)}>
                             {kr.isOpen ? <ChevronDown size={18} className="mr-2 text-gray-500"/> : <ChevronRight size={18} className="mr-2 text-gray-500"/>}
                             <p className="font-semibold text-gray-600">{kr.title}</p>
                             {getDueDateDisplay(kr.dueDate)}
                          </div>
                          <div className="flex items-center">
                              <button onClick={(e) => {e.stopPropagation(); onEdit('KEY_RESULT', kr, objective.id);}} className="text-gray-400 hover:text-blue-500 mr-2" aria-label="Edit Key Result"><Edit size={14}/></button>
                              <button onClick={(e) => {e.stopPropagation(); onDeleteKeyResult(objective.id, kr.id);}} className="text-gray-400 hover:text-red-500" aria-label="Delete Key Result"><Trash2 size={14}/></button>
                          </div>
                     </div>
                     <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full ml-6">
                         <div style={{ width: `${kr.progress}%` }} className="h-full bg-green-500 rounded-full transition-all duration-500"></div>
                     </div>
                     
                     {kr.isOpen && (
                         <div className="pl-6 mt-2">
                             {kr.actionItems.map(ai => (
                                 <div key={ai.id} className="flex items-center justify-between py-1">
                                     <div className="flex items-center">
                                         <input type="checkbox" checked={ai.isCompleted} onChange={() => onToggleActionItemCompletion(objective.id, kr.id, ai.id)} className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                         <span className={`text-sm ${ai.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{ai.title}</span>
                                         {getDueDateDisplay(ai.dueDate)}
                                     </div>
                                     <div className="flex items-center">
                                         <button onClick={(e) => {e.stopPropagation(); onEdit('ACTION_ITEM', ai, objective.id, kr.id);}} className="text-gray-400 hover:text-blue-500 mr-2" aria-label="Edit Action Item"><Edit size={12}/></button>
                                         <button onClick={(e) => {e.stopPropagation(); onDeleteActionItem(objective.id, kr.id, ai.id);}} className="text-gray-400 hover:text-red-500" aria-label="Delete Action Item"><Trash2 size={12}/></button>
                                     </div>
                                 </div>
                             ))}
                             <button onClick={() => onAdd('ACTION_ITEM', objective.id, kr.id)} className="text-sm text-blue-500 hover:text-blue-600 mt-2">+ Add Action Item</button>
                         </div>
                     )}
                   </div>
                 ))}
                 <button onClick={() => onAdd('KEY_RESULT', objective.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-3">+ Add Key Result</button>
               </div>
             )}
           </div>
         ))
       )}
    </div>
  );
};

export default ObjectiveList;
