import type { Objective } from '../types';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, GripVertical } from 'lucide-react';
import KeyResultItem from './KeyResultItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDDay } from '../utils';
import { useObjectiveContext } from '../contexts/ObjectiveContext';

interface ObjectiveItemProps {
  objective: Objective;
}

export default function ObjectiveItem({ objective }: ObjectiveItemProps) {
  const { 
    onToggleObjective, 
    onAddKeyResult, 
    onDeleteObjective, 
    onEditObjective 
  } = useObjectiveContext();
  
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: objective.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dDay = objective.dueDate ? getDDay(objective.dueDate) : null;

  return (
    <div ref={setNodeRef} style={style} className="bg-white shadow-md rounded-lg p-3 mb-4">
      <div className="flex flex-col w-full">
        {/* Row 1: Title and Expander */}
        <div className="flex items-start">
            <div {...attributes} {...listeners} className="cursor-move p-1 flex-none touch-none select-none">
                <GripVertical size={24} className="text-gray-400" />
            </div>
            <button onClick={() => onToggleObjective(objective.id)} className="mr-2 flex-none pt-0.5">
                {objective.isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
            </button>
            <h2 className="flex-1 font-bold mb-1 text-sm line-clamp-2">
                {objective.title}
            </h2>
        </div>

        {/* Row 2: Hybrid Row (Meta, Progress, Buttons) */}
        <div className="flex items-center justify-between gap-3 w-full pl-10 mt-1">
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
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${objective.progress}%` }}></div>
            </div>

            {/* Right: Buttons */}
            <div className="flex gap-1 flex-none">
                <button onClick={() => onAddKeyResult(objective.id)} className="p-1 text-gray-500 hover:text-blue-600">
                    <Plus size={20} />
                </button>
                <button onClick={() => onEditObjective(objective)} className="p-1 text-gray-500 hover:text-blue-600">
                    <Edit size={20} />
                </button>
                <button onClick={() => onDeleteObjective(objective.id)} className="p-1 text-gray-500 hover:text-red-600">
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
      </div>

      {objective.isOpen && (
        <div className="mt-4 pl-10">
          <SortableContext items={objective.keyResults.map(kr => kr.id)} strategy={verticalListSortingStrategy}>
            {objective.keyResults.map(kr => (
              <KeyResultItem 
                key={kr.id}
                objectiveId={objective.id}
                kr={kr}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
