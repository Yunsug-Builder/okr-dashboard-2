import type { ActionItem } from '../types';
import { GripVertical, Trash2, Edit } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm mb-2 gap-4"
    >
        {/* Left Part: Drag handle, checkbox, and title. Takes up remaining space. */}
        <div className="flex items-center flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-move p-1 flex-shrink-0">
                <GripVertical size={16} className="text-gray-400" />
            </div>
            <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={onToggle}
                className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <span className={`truncate ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {item.title}
                </span>
                {item.dueDate && (
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>

        {/* Right Part: Buttons. Fixed width. */}
        <div className="flex items-center flex-none ml-3">
            <div className="flex items-center gap-1 flex-none">
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
