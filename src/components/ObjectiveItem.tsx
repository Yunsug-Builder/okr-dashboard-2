import type { Objective, KeyResult, ActionItem } from '../types';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import KeyResultItem from './KeyResultItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ObjectiveItemProps {
  objective: Objective;
  onToggle: () => void;
  onAddKeyResult: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onAddActionItem: (keyResultId: string) => void;
  onDeleteKeyResult: (keyResultId: string) => void;
  onEditKeyResult: (keyResult: KeyResult) => void;
  onToggleKeyResult: (keyResultId: string) => void;
  onToggleActionItem: (keyResultId: string, actionItemId: string) => void;
  onDeleteActionItem: (keyResultId: string, actionItemId: string) => void;
  onEditActionItem: (keyResultId: string, actionItem: ActionItem) => void;
}

export default function ObjectiveItem({ 
    objective, 
    onToggle, 
    onAddKeyResult, 
    onDelete, 
    onEdit, 
    onAddActionItem,
    onDeleteKeyResult,
    onEditKeyResult,
    onToggleKeyResult,
    onToggleActionItem,
    onDeleteActionItem,
    onEditActionItem,
}: ObjectiveItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: objective.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex flex-col">
        {/* Top Row */}
        <div className="flex items-center w-full mb-2">
          <div {...attributes} {...listeners} className="cursor-move p-1 flex-none">
            <GripVertical size={24} className="text-gray-400" />
          </div>
          <button onClick={onToggle} className="mr-2 flex-none">
            {objective.isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
          </button>
          <h2 className="flex-1 font-semibold truncate mr-2 text-lg">{objective.title}</h2>
          {objective.dueDate && (
            <p className="text-xs text-gray-400 whitespace-nowrap mr-2">
              Due: {new Date(objective.dueDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex gap-1 flex-none">
            <button onClick={onAddKeyResult} className="p-1 text-gray-500 hover:text-blue-600">
              <Plus size={20} />
            </button>
            <button onClick={onEdit} className="p-1 text-gray-500 hover:text-blue-600">
              <Edit size={20} />
            </button>
            <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-600">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Bottom Row - Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${objective.progress}%` }}></div>
        </div>
      </div>

      {objective.isOpen && (
        <div className="mt-4 pl-10">
          <SortableContext items={objective.keyResults.map(kr => kr.id)} strategy={verticalListSortingStrategy}>
            {objective.keyResults.map(kr => (
              <KeyResultItem 
                key={kr.id}
                kr={kr}
                onToggle={() => onToggleKeyResult(kr.id)}
                onAddActionItem={() => onAddActionItem(kr.id)}
                onDelete={() => onDeleteKeyResult(kr.id)}
                onEdit={() => onEditKeyResult(kr)}
                onToggleActionItem={(actionItemId) => onToggleActionItem(kr.id, actionItemId)}
                onDeleteActionItem={(actionItemId) => onDeleteActionItem(kr.id, actionItemId)}
                onEditActionItem={(actionItem) => onEditActionItem(kr.id, actionItem)}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
