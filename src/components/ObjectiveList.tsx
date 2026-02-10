import ObjectiveItem from './ObjectiveItem';
import type { Objective } from '../types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ObjectiveListProps {
  objectives: Objective[];
}

export default function ObjectiveList({ objectives }: ObjectiveListProps) {
  if (objectives.length === 0) {
    return (
      <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">No objectives yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new objective.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
        <SortableContext items={objectives.map(obj => obj.id)} strategy={verticalListSortingStrategy}>
            {objectives.map(obj => (
                <ObjectiveItem
                    key={obj.id}
                    objective={obj}
                />
            ))}
        </SortableContext>
    </div>
  );
}
