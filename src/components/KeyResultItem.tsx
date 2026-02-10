import type { KeyResult, ActionItem } from '../types';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import ActionItemItem from './ActionItemItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDDay } from '../utils';

interface KeyResultItemProps {
  kr: KeyResult;
  onToggle: () => void;
  onAddActionItem: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleActionItem: (actionItemId: string) => void;
  onDeleteActionItem: (actionItemId: string) => void;
  onEditActionItem: (actionItem: ActionItem) => void;
}

export default function KeyResultItem({ 
    kr, 
    onToggle, 
    onAddActionItem, 
    onDelete, 
    onEdit,
    onToggleActionItem,
    onDeleteActionItem,
    onEditActionItem,
}: KeyResultItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: kr.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dDay = kr.dueDate ? getDDay(kr.dueDate) : null;

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-100 p-3 rounded-lg mb-3">
      <div className="flex flex-col w-full">
        {/* Row 1: Title and Expander */}
        <div className="flex items-start">
            <div {...attributes} {...listeners} className="cursor-move p-1 flex-none">
                <GripVertical size={20} className="text-gray-400" />
            </div>
            <button onClick={onToggle} className="mr-2 flex-none pt-0.5">
                {kr.isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <h3 className="flex-1 font-semibold mb-1 text-sm line-clamp-2">
                {kr.title}
            </h3>
        </div>

        {/* Row 2: Hybrid Row (Meta, Progress, Buttons) */}
        <div className="flex items-center justify-between gap-3 w-full pl-8 mt-1">
            {/* Left: D-Day Badge */}
            <div className="flex-none">
                {dDay && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${dDay.colorClass}`}>
                        {dDay.text}
                    </span>
                )}
            </div>

            {/* Middle: Progress Bar */}
            <div className="bg-gray-200 rounded-full h-2 flex-1">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${kr.progress}%` }}></div>
            </div>

            {/* Right: Buttons */}
            <div className="flex gap-1 flex-none">
                <button onClick={onAddActionItem} className="p-1 text-gray-500 hover:text-blue-600">
                    <Plus size={18} />
                </button>
                <button onClick={onEdit} className="p-1 text-gray-500 hover:text-blue-600">
                    <Edit size={18} />
                </button>
                <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-600">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
      </div>

      {kr.isOpen && (
        <div className="mt-4 pl-8">
          <SortableContext items={kr.actionItems.map(ai => ai.id)} strategy={verticalListSortingStrategy}>
            {kr.actionItems.map(item => (
              <ActionItemItem 
                key={item.id}
                item={item} 
                onToggle={() => onToggleActionItem(item.id)}
                onDelete={() => onDeleteActionItem(item.id)}
                onEdit={() => onEditActionItem(item)}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
