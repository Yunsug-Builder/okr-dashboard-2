import type { ActionItem } from '../types';
import { GripVertical, Trash2, Edit } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDDay } from '../utils';

interface ActionItemProps {
  item: ActionItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export default function ActionItemItem({ item, onToggle, onDelete, onEdit }: ActionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dDay = item.dueDate ? getDDay(item.dueDate) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col bg-white p-2 rounded-md shadow-sm mb-2 gap-1"
    >
        {/* Row 1: Checkbox and Title */}
        <div className="flex items-start gap-2">
            <div {...attributes} {...listeners} className="cursor-move p-1 flex-none">
                <GripVertical size={16} className="text-gray-400" />
            </div>
            <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={onToggle}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-none"
            />
            <span className={`flex-1 line-clamp-2 text-sm ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {item.title}
            </span>
        </div>

        {/* Row 2: Meta Info & Buttons (indented) */}
        <div className="flex items-center justify-between w-full pl-12">
            {dDay ? (
                <span className={`text-xs px-1 rounded ${dDay.colorClass}`}>
                    {dDay.text}
                </span>
            ) : <span />}
            <div className="flex gap-1 flex-none">
                <button onClick={onEdit} className="p-1 text-gray-500 hover:text-blue-600">
                    <Edit size={16} />
                </button>
                <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-600">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    </div>
  );
}
