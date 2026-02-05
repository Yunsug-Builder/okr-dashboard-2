import { useState } from 'react';
import type { Objective, KeyResult, ActionItem } from './types';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ObjectiveList from './components/ObjectiveList';

function App() {
  const [isObjectiveExpanded, setIsObjectiveExpanded] = useState(true);
  const [expandedKeyResultIds, setExpandedKeyResultIds] = useState<string[]>([]);

  const initialObjective: Objective = {
    id: uuidv4(),
    title: 'Become a Senior Frontend Engineer',
    progress: 60,
    keyResults: [
      {
        id: uuidv4(),
        title: 'Complete 5 complex React projects',
        progress: 80,
        actionItems: [
          { id: uuidv4(), title: 'Build a dashboard application', isCompleted: true },
          { id: uuidv4(), title: 'Develop an e-commerce site', isCompleted: true },
          { id: uuidv4(), title: 'Create a real-time chat application', isCompleted: false },
        ],
      },
      {
        id: uuidv4(),
        title: 'Master advanced TypeScript concepts',
        progress: 40,
        actionItems: [
          { id: uuidv4(), title: 'Read "Effective TypeScript" book', isCompleted: true },
          { id: uuidv4(), title: 'Implement generic utility types', isCompleted: false },
        ],
      },
    ],
  };

  const [objectives, setObjectives] = useState<Objective[]>([initialObjective]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addObjective = () => {
    const title = window.prompt('Enter new objective title:');
    if (title) {
      const newObjective: Objective = {
        id: uuidv4(),
        title,
        progress: 0,
        keyResults: [],
      };
      setObjectives(prev => [...prev, newObjective]);
    }
  };

  const deleteObjective = (id: string) => {
    setObjectives(prev => prev.filter(objective => objective.id !== id));
  };

  const handleObjectiveTitleChange = (id: string, newTitle: string) => {
    setObjectives(prev =>
      prev.map(objective =>
        objective.id === id ? { ...objective, title: newTitle } : objective
      )
    );
  };

  const addKeyResult = (objectiveId: string) => {
    const title = window.prompt('Enter new key result title:');
    if (title) {
      const newKeyResult: KeyResult = {
        id: uuidv4(),
        title,
        progress: 0,
        actionItems: [],
      };
      setObjectives(prevObjectives =>
        prevObjectives.map(obj =>
          obj.id === objectiveId
            ? { ...obj, keyResults: [...obj.keyResults, newKeyResult] }
            : obj
        )
      );
    }
  };

  const deleteKeyResult = (objectiveId: string, keyResultId: string) => {
    setObjectives(prevObjectives =>
      prevObjectives.map(obj =>
        obj.id === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.filter(kr => kr.id !== keyResultId),
            }
          : obj
      )
    );
  };

  const addActionItem = (objectiveId: string, keyResultId: string) => {
    const title = window.prompt('Enter new action item title:');
    if (title) {
      const newActionItem: ActionItem = {
        id: uuidv4(),
        title,
        isCompleted: false,
      };
      setObjectives(prevObjectives =>
        prevObjectives.map(obj =>
          obj.id === objectiveId
            ? {
                ...obj,
                keyResults: obj.keyResults.map(kr =>
                  kr.id === keyResultId
                    ? { ...kr, actionItems: [...kr.actionItems, newActionItem] }
                    : kr
                ),
              }
            : obj
        )
      );
    }
  };

  const toggleActionItemCompletion = (objectiveId: string, keyResultId: string, actionItemId: string) => {
    setObjectives(prevObjectives =>
      prevObjectives.map(obj =>
        obj.id === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map(kr =>
                kr.id === keyResultId
                  ? {
                      ...kr,
                      actionItems: kr.actionItems.map(ai =>
                        ai.id === actionItemId ? { ...ai, isCompleted: !ai.isCompleted } : ai
                      ),
                    }
                  : kr
              ),
            }
          : obj
      )
    );
  };

  const deleteActionItem = (objectiveId: string, keyResultId: string, actionItemId: string) => {
    setObjectives(prevObjectives =>
      prevObjectives.map(obj =>
        obj.id === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map(kr =>
                kr.id === keyResultId
                  ? {
                      ...kr,
                      actionItems: kr.actionItems.filter(ai => ai.id !== actionItemId),
                    }
                  : kr
              ),
            }
          : obj
      )
    );
  };


  const toggleObjectiveExpansion = () => {
    setIsObjectiveExpanded(prev => !prev);
  };

  const toggleKeyResult = (id: string) => {
    setExpandedKeyResultIds(prev =>
      prev.includes(id)
        ? prev.filter(krId => krId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50 shadow-lg p-4 relative pb-20">
      <ObjectiveList
        objectives={objectives}
        isObjectiveExpanded={isObjectiveExpanded}
        toggleObjectiveExpansion={toggleObjectiveExpansion}
        expandedKeyResultIds={expandedKeyResultIds}
        toggleKeyResult={toggleKeyResult}
        editingId={editingId}
        setEditingId={setEditingId}
        deleteObjective={deleteObjective}
        handleObjectiveTitleChange={handleObjectiveTitleChange}
        addKeyResult={addKeyResult}
        addActionItem={addActionItem}
        toggleActionItemCompletion={toggleActionItemCompletion}
        deleteActionItem={deleteActionItem}
        deleteKeyResult={deleteKeyResult}
      />

      {/* Floating Action Button */}
      <button
        onClick={addObjective}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
        aria-label="Add Objective"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default App;
