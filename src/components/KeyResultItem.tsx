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
    <div ref={setNodeRef} style={style} className="bg-gray-100 p-3 rounded-lg mb-3 pr-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-move p-1 flex-shrink-0">
                <GripVertical size={20} className="text-gray-400" />
            </div>
            <button onClick={onToggle} className="mr-2 flex-shrink-0">
                {kr.isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <h3 className="text-lg font-semibold text-gray-800 truncate flex-1">{kr.title}</h3>
        </div>
        <div className="flex items-center flex-shrink-0 ml-3">
            <div className="w-32 max-w-[150px] bg-gray-200 rounded-full h-2.5 mr-3 flex-shrink-0">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${kr.progress}%` }}></div>
            </div>
            <span className="text-gray-600 mr-3 text-sm flex-shrink-0">{kr.progress}%</span>
            <span className="text-gray-500 text-sm mr-3 whitespace-nowrap flex-shrink-0">{kr.dueDate}</span>
            <div className="flex items-center gap-1">
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
