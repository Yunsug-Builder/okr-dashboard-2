import type { KeyResult, ActionItem } from '../types';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import ActionItemItem from './ActionItemItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-100 p-3 rounded-lg mb-3">
      <div className="flex flex-col">
        {/* Top Row */}
        <div className="flex items-center w-full mb-2">
          <div {...attributes} {...listeners} className="cursor-move p-1 flex-none">
            <GripVertical size={20} className="text-gray-400" />
          </div>
          <button onClick={onToggle} className="mr-2 flex-none">
            {kr.isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <h3 className="flex-1 font-semibold truncate mr-2 text-md">{kr.title}</h3>
          {kr.dueDate && (
            <p className="text-xs text-gray-400 whitespace-nowrap mr-2">
              Due: {new Date(kr.dueDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex gap-1 flex-none">
            <button onClick={onAddActionItem} className="p-1 text-gray-500 hover:text-blue-600">
              <Plus size={16} />
            </button>
            <button onClick={onEdit} className="p-1 text-gray-500 hover:text-blue-600">
              <Edit size={16} />
            </button>
            <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Row - Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${kr.progress}%` }}></div>
        </div>
      </div>

      {kr.isOpen && (
        <div className="mt-3 pl-8">
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
