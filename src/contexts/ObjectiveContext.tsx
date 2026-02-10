import { createContext, useContext } from 'react';
import type { Objective, KeyResult, ActionItem } from '../types';

interface ObjectiveContextType {
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

export const ObjectiveContext = createContext<ObjectiveContextType | undefined>(undefined);

export const useObjectiveContext = () => {
  const context = useContext(ObjectiveContext);
  if (!context) {
    throw new Error('useObjectiveContext must be used within an ObjectiveProvider');
  }
  return context;
};
