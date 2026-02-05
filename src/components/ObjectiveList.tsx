import React from 'react';
import type { Objective } from '../types';
import ObjectiveItem from './ObjectiveItem';

interface ObjectiveListProps {
  objectives: Objective[];
  isObjectiveExpanded: boolean;
  toggleObjectiveExpansion: () => void;
  expandedKeyResultIds: string[];
  toggleKeyResult: (keyResultId: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  deleteObjective: (id: string) => void;
  handleObjectiveTitleChange: (objectiveId: string, newTitle: string) => void;
  addKeyResult: (objectiveId: string) => void;
  addActionItem: (objectiveId: string, keyResultId: string) => void;
  toggleActionItemCompletion: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
  deleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  deleteActionItem: (objectiveId: string, keyResultId: string, actionItemId: string) => void;
}

const ObjectiveList: React.FC<ObjectiveListProps> = ({
  objectives,
  isObjectiveExpanded,
  toggleObjectiveExpansion,
  expandedKeyResultIds,
  toggleKeyResult,
  editingId,
  setEditingId,
  deleteObjective,
  handleObjectiveTitleChange,
  addKeyResult,
  addActionItem,
  toggleActionItemCompletion,
  deleteKeyResult,
  deleteActionItem,
}) => {
  return (
    <>
      {objectives.map((objective) => (
        <ObjectiveItem
          key={objective.id}
          objective={objective}
          isObjectiveExpanded={isObjectiveExpanded}
          toggleObjectiveExpansion={toggleObjectiveExpansion}
          editingId={editingId}
          setEditingId={setEditingId}
          handleObjectiveTitleChange={handleObjectiveTitleChange}
          deleteObjective={deleteObjective}
          addKeyResult={addKeyResult}
          expandedKeyResultIds={expandedKeyResultIds}
          toggleKeyResult={toggleKeyResult}
          addActionItem={addActionItem}
          toggleActionItemCompletion={toggleActionItemCompletion}
          deleteKeyResult={deleteKeyResult}
          deleteActionItem={deleteActionItem}
        />
      ))}
    </>
  );
};

export default ObjectiveList;
