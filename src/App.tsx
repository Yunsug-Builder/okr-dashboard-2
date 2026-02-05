import { useState, useEffect } from 'react';
import type { Objective, KeyResult, ActionItem } from './types';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ObjectiveList from './components/ObjectiveList';
import { fetchObjectives, addObjectiveToDB } from './services/firestore';

function App() {
  const [isObjectiveExpanded, setIsObjectiveExpanded] = useState(true);
  const [expandedKeyResultIds, setExpandedKeyResultIds] = useState<string[]>([]);

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const getObjectives = async () => {
      try {
        const fetchedObjectives = await fetchObjectives();
        setObjectives(fetchedObjectives);
      } catch (error) {
        console.error("Error fetching objectives:", error);
      }
    };
    getObjectives();
  }, []);

  const addObjective = async () => {
    const title = window.prompt('Enter new objective title:');
    if (title) {
      try {
        const newId = await addObjectiveToDB(title);
        const newObjective: Objective = {
          id: newId,
          title,
          progress: 0,
          keyResults: [],
          isOpen: false,
        };
        setObjectives(prev => [...prev, newObjective]);
      } catch (error) {
        console.error("Error adding objective:", error);
      }
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
