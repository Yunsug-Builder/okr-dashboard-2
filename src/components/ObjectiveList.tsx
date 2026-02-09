import ObjectiveItem from './ObjectiveItem';
import type { Objective, KeyResult, ActionItem } from '../types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ObjectiveListProps {
  objectives: Objective[];
  onToggleObjective: (id: string) => void;
  onAddKeyResult: (objectiveId: string) => void;
  onDeleteObjective: (id: string) => void;
  onEditObjective: (objective: Objective) => void;
  onAddActionItem: (objectiveId: string, keyResultId: string) => void;
  onDeleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  onEditKeyResult: (objectiveId: string, keyResult: KeyResult) => void;
  onToggleKeyResult: (objectiveId: string, keyResultId: string) => void;
  onToggleActionItem: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  onDeleteActionItem: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  onEditActionItem: (objectiveId: string, keyResultId: string, actionItem: ActionItem) => void;
}

export default function ObjectiveList({ 
    objectives, 
    onToggleObjective, 
    onAddKeyResult, 
    onDeleteObjective, 
    onEditObjective,
    onAddActionItem,
    onDeleteKeyResult,
    onEditKeyResult,
    onToggleKeyResult,
    onToggleActionItem,
    onDeleteActionItem,
    onEditActionItem,
}: ObjectiveListProps) {
  return (
    <div className="p-4">
        <SortableContext items={objectives.map(obj => obj.id)} strategy={verticalListSortingStrategy}>
            {objectives.map(obj => (
                <ObjectiveItem
                    key={obj.id}
                    objective={obj}
                    onToggle={() => onToggleObjective(obj.id)}
                    onAddKeyResult={() => onAddKeyResult(obj.id)}
                    onDelete={() => onDeleteObjective(obj.id)}
                    onEdit={() => onEditObjective(obj)}
                    onAddActionItem={(keyResultId) => onAddActionItem(obj.id, keyResultId)}
                    onDeleteKeyResult={(keyResultId) => onDeleteKeyResult(obj.id, keyResultId)}
                    onEditKeyResult={(keyResult) => onEditKeyResult(obj.id, keyResult)}
                    onToggleKeyResult={(keyResultId) => onToggleKeyResult(obj.id, keyResultId)}
                    onToggleActionItem={(keyResultId, actionItemId) => onToggleActionItem(obj.id, keyResultId, actionItemId)}
                    onDeleteActionItem={(keyResultId, actionItemId) => onDeleteActionItem(obj.id, keyResultId, actionItemId)}
                    onEditActionItem={(keyResultId, actionItem) => onEditActionItem(obj.id, keyResultId, actionItem)}
                />
            ))}
        </SortableContext>
    </div>
  );
}
