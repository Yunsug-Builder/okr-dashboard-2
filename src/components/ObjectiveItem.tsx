import type { Objective, KeyResult, ActionItem } from '../types';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import KeyResultItem from './KeyResultItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDDay } from '../utils';

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

  const dDay = objective.dueDate ? getDDay(objective.dueDate) : null;

  return (
    <div ref={setNodeRef} style={style} className="bg-white shadow-md rounded-lg p-2 mb-4">
      <div className="flex flex-col w-full">
        {/* Row 1: Title and Expander */}
        <div className="flex items-start">
            <div {...attributes} {...listeners} className="cursor-move p-1 flex-none">
                <GripVertical size={24} className="text-gray-400" />
            </div>
            <button onClick={onToggle} className="mr-2 flex-none">
                {objective.isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
            </button>
            <h2 className="flex-1 font-bold mb-1 text-sm line-clamp-2">
                {objective.title}
            </h2>
        </div>

        {/* Row 2: Meta Info & Buttons */}
        <div className="flex items-center justify-between w-full mb-2 pl-10">
            {dDay ? (
                <span className={`text-xs px-1 rounded ${dDay.colorClass}`}>
                    {dDay.text}
                </span>
            ) : <span />}
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

        {/* Row 3: Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 ml-10">
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
