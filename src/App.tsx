import { useState, useEffect } from 'react';
import type { Objective, KeyResult, ActionItem } from './types';
import { Plus, Trash2, ChevronDown, ChevronRight, Edit, Check, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchObjectives, 
  addObjectiveToDB, 
  deleteObjectiveFromDB,
  updateObjectiveInDB 
} from './services/firestore';

function App() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

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
        if (newId) {
          const newObjective: Objective = {
            id: newId,
            title,
            progress: 0,
            keyResults: [],
            isOpen: true,
          };
          setObjectives(prev => [...prev, newObjective]);
        }
      } catch (error) {
        console.error("Error adding objective:", error);
      }
    }
  };

  const deleteObjective = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this objective?')) {
      try {
        const success = await deleteObjectiveFromDB(id);
        if (success) {
          setObjectives(prev => prev.filter(objective => objective.id !== id));
        }
      } catch (error) {
        console.error('Error deleting objective:', error);
      }
    }
  };
  
  const handleStartEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };
  
  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleObjectiveTitleChange = async (id: string) => {
    if (editingTitle.trim() === '') return;
    try {
      const success = await updateObjectiveInDB(id, { title: editingTitle });
      if (success) {
        setObjectives(prev =>
          prev.map(objective =>
            objective.id === id ? { ...objective, title: editingTitle } : objective
          )
        );
        handleCancelEditing();
      }
    } catch (error) {
      console.error(`Error updating objective ${id} title:`, error);
    }
  };

  const addKeyResult = async (objectiveId: string) => {
    const title = window.prompt('Enter new key result title:');
    if (title) {
      const objective = objectives.find(o => o.id === objectiveId);
      if (!objective) return;

      const newKeyResult: KeyResult = {
        id: uuidv4(),
        title,
        progress: 0,
        actionItems: [],
        isOpen: true,
      };
      
      const updatedKeyResults = [...objective.keyResults, newKeyResult];
      const success = await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });

      if (success) {
        setObjectives(prev =>
          prev.map(obj =>
            obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
          )
        );
      }
    }
  };

  const deleteKeyResult = async (objectiveId: string, keyResultId: string) => {
     if (window.confirm('Are you sure you want to delete this key result?')) {
        const objective = objectives.find(o => o.id === objectiveId);
        if (!objective) return;

        const updatedKeyResults = objective.keyResults.filter(kr => kr.id !== keyResultId);
        const success = await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });

        if (success) {
            setObjectives(prev =>
            prev.map(obj =>
                obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
            )
            );
        }
     }
  };

  const addActionItem = async (objectiveId: string, keyResultId: string) => {
    const title = window.prompt('Enter new action item title:');
    if (title) {
      const objective = objectives.find(o => o.id === objectiveId);
      if (!objective) return;

      const newActionItem: ActionItem = { id: uuidv4(), title, isCompleted: false };
      
      const updatedKeyResults = objective.keyResults.map(kr => {
        if (kr.id === keyResultId) {
          return { ...kr, actionItems: [...kr.actionItems, newActionItem] };
        }
        return kr;
      });

      const success = await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });
      if (success) {
        setObjectives(prev =>
          prev.map(obj =>
            obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
          )
        );
      }
    }
  };
  
  const toggleActionItemCompletion = async (objectiveId: string, keyResultId: string, actionItemId: string) => {
      const objective = objectives.find(o => o.id === objectiveId);
      if (!objective) return;

      const updatedKeyResults = objective.keyResults.map(kr => {
        if (kr.id === keyResultId) {
           const updatedActionItems = kr.actionItems.map(ai =>
              ai.id === actionItemId ? { ...ai, isCompleted: !ai.isCompleted } : ai
            );
            return { ...kr, actionItems: updatedActionItems };
        }
        return kr;
      });

      const success = await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });
      if (success) {
        setObjectives(prev =>
          prev.map(obj =>
            obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
          )
        );
      }
  };

  const deleteActionItem = async (objectiveId: string, keyResultId: string, actionItemId: string) => {
    const objective = objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    const updatedKeyResults = objective.keyResults.map(kr => {
        if (kr.id === keyResultId) {
            return { ...kr, actionItems: kr.actionItems.filter(ai => ai.id !== actionItemId) };
        }
        return kr;
    });

    const success = await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });
    if (success) {
        setObjectives(prev =>
        prev.map(obj =>
            obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
        )
        );
    }
  };

  const toggleObjectiveOpen = async (id: string) => {
    const objective = objectives.find(o => o.id === id);
    if (!objective) return;
    
    const success = await updateObjectiveInDB(id, { isOpen: !objective.isOpen });
    if (success) {
      setObjectives(prev =>
        prev.map(obj =>
          obj.id === id ? { ...obj, isOpen: !obj.isOpen } : obj
        )
      );
    }
  };
  
  const toggleKeyResultOpen = async (objectiveId: string, keyResultId: string) => {
      const objective = objectives.find(o => o.id === objectiveId);
      if (!objective) return;

      const updatedKeyResults = objective.keyResults.map(kr => 
          kr.id === keyResultId ? { ...kr, isOpen: !kr.isOpen } : kr
      );

      const success = await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });
      if (success) {
          setObjectives(prev =>
              prev.map(obj =>
                  obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
              )
          );
      }
  };
  
  // Calculate progress
  useEffect(() => {
    const newObjectives = objectives.map(objective => {
      if (objective.keyResults.length === 0) {
        return { ...objective, progress: 0 };
      }
      
      const keyResultsWithProgress = objective.keyResults.map(kr => {
        if (kr.actionItems.length === 0) {
            return { ...kr, progress: 0 };
        }
        const completed = kr.actionItems.filter(ai => ai.isCompleted).length;
        const total = kr.actionItems.length;
        const progress = Math.round((completed / total) * 100);
        return { ...kr, progress };
      });

      const totalProgress = keyResultsWithProgress.reduce((sum, kr) => sum + kr.progress, 0);
      const overallProgress = Math.round(totalProgress / objective.keyResults.length);
      
      return { ...objective, progress: overallProgress, keyResults: keyResultsWithProgress };
    });

    // Only update state if progress has actually changed to avoid infinite loops
    if (JSON.stringify(newObjectives) !== JSON.stringify(objectives)) {
        setObjectives(newObjectives);
    }
  }, [objectives]);


  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50 shadow-lg p-4 relative pb-20 font-sans">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Objectives</h1>
        <p className="text-gray-500">Your roadmap to success.</p>
      </header>

      <div>
        {objectives.map((objective) => (
          <div key={objective.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
               <div className="flex items-center justify-between">
                {editingId === objective.id ? (
                  <div className="flex-grow flex items-center">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="flex-grow p-1 border rounded-md"
                      autoFocus
                    />
                    <button onClick={() => handleObjectiveTitleChange(objective.id)} className="ml-2 text-green-500"><Check size={20}/></button>
                    <button onClick={handleCancelEditing} className="ml-2 text-red-500"><X size={20}/></button>
                  </div>
                ) : (
                  <>
                    <div className="flex-grow flex items-center cursor-pointer" onClick={() => toggleObjectiveOpen(objective.id)}>
                        {objective.isOpen ? <ChevronDown size={20} className="mr-2 text-gray-500"/> : <ChevronRight size={20} className="mr-2 text-gray-500"/>}
                        <h2 className="text-lg font-semibold text-gray-700">{objective.title}</h2>
                    </div>
                    <div className="flex items-center">
                        <button onClick={(e) => {e.stopPropagation(); handleStartEditing(objective.id, objective.title);}} className="text-gray-400 hover:text-blue-500 mr-2"><Edit size={16}/></button>
                        <button onClick={(e) => {e.stopPropagation(); deleteObjective(objective.id);}} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                <div style={{ width: `${objective.progress}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-500"></div>
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">{objective.progress}%</div>
            </div>

            {objective.isOpen && (
              <div className="p-4 bg-gray-50">
                {objective.keyResults.map(kr => (
                  <div key={kr.id} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between">
                         <div className="flex-grow flex items-center cursor-pointer" onClick={() => toggleKeyResultOpen(objective.id, kr.id)}>
                            {kr.isOpen ? <ChevronDown size={18} className="mr-2 text-gray-500"/> : <ChevronRight size={18} className="mr-2 text-gray-500"/>}
                            <p className="font-semibold text-gray-600">{kr.title}</p>
                         </div>
                         <button onClick={() => deleteKeyResult(objective.id, kr.id)} className="text-gray-400 hover:text-red-500 ml-2"><Trash2 size={14}/></button>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full ml-6">
                        <div style={{ width: `${kr.progress}%` }} className="h-full bg-green-500 rounded-full transition-all duration-500"></div>
                    </div>
                    
                    {kr.isOpen && (
                        <div className="pl-6 mt-2">
                            {kr.actionItems.map(ai => (
                                <div key={ai.id} className="flex items-center justify-between py-1">
                                    <div className="flex items-center">
                                        <input type="checkbox" checked={ai.isCompleted} onChange={() => toggleActionItemCompletion(objective.id, kr.id, ai.id)} className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                        <span className={`text-sm ${ai.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{ai.title}</span>
                                    </div>
                                    <button onClick={() => deleteActionItem(objective.id, kr.id, ai.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                                </div>
                            ))}
                            <button onClick={() => addActionItem(objective.id, kr.id)} className="text-sm text-blue-500 hover:text-blue-600 mt-2">+ Add Action Item</button>
                        </div>
                    )}
                  </div>
                ))}
                <button onClick={() => addKeyResult(objective.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-3">+ Add Key Result</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addObjective}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
        aria-label="Add Objective"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default App;
