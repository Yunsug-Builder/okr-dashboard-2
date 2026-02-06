import { useState, useEffect, useMemo } from 'react';
import type { Objective, KeyResult, ActionItem } from './types';
import { Plus, Trash2, ChevronDown, ChevronRight, Edit, Check, X, LogOut, LogIn } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { 
  fetchObjectives, 
  addObjectiveToDB, 
  deleteObjectiveFromDB,
  updateObjectiveInDB 
} from './services/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { app } from './firebase'; // Assuming 'app' is exported from firebase.ts

type ModalType = 'OBJECTIVE' | 'KEY_RESULT' | 'ACTION_ITEM' | null;

function App() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [targetObjectiveId, setTargetObjectiveId] = useState<string | null>(null);
  const [targetKeyResultId, setTargetKeyResultId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDate, setNewItemDate] = useState('');

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        const getObjectives = async () => {
          try {
            const fetchedObjectives = await fetchObjectives(currentUser.uid);
            setObjectives(fetchedObjectives);
          } catch (error) {
            console.error("Error fetching objectives:", error);
          }
        };
        getObjectives();
      } else {
        setObjectives([]);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // --- Modal Handlers ---
  const openModal = (type: ModalType, objId: string | null = null, krId: string | null = null) => {
    setModalType(type);
    setTargetObjectiveId(objId);
    setTargetKeyResultId(krId);
    setNewItemTitle('');
    setNewItemDate('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setTargetObjectiveId(null);
    setTargetKeyResultId(null);
    setNewItemTitle('');
    setNewItemDate('');
  };

  const handleSaveItem = async () => {
    if (!user || !newItemTitle.trim()) {
      alert("Title cannot be empty!");
      return;
    }

    const itemDueDate = newItemDate.trim() === '' ? undefined : newItemDate;

    try {
      if (modalType === 'OBJECTIVE') {
        const newId = await addObjectiveToDB(newItemTitle, user.uid, itemDueDate);
        if (newId) {
          const newObjective: Objective = {
            id: newId,
            userId: user.uid,
            title: newItemTitle,
            progress: 0,
            keyResults: [],
            isOpen: true,
            dueDate: itemDueDate,
          };
          setObjectives(prev => [...prev, newObjective]);
        }
      } else if (modalType === 'KEY_RESULT' && targetObjectiveId) {
        const objective = objectives.find(o => o.id === targetObjectiveId);
        if (!objective) return;

        const newKeyResult: KeyResult = {
          id: uuidv4(),
          title: newItemTitle,
          progress: 0,
          actionItems: [],
          isOpen: true,
          dueDate: itemDueDate,
        };
        
        const updatedKeyResults = [...objective.keyResults, newKeyResult];
        const success = await updateObjectiveInDB(targetObjectiveId, { keyResults: updatedKeyResults });

        if (success) {
          setObjectives(prev =>
            prev.map(obj =>
              obj.id === targetObjectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
            )
          );
        }
      } else if (modalType === 'ACTION_ITEM' && targetObjectiveId && targetKeyResultId) {
        const objective = objectives.find(o => o.id === targetObjectiveId);
        if (!objective) return;

        const updatedKeyResults = objective.keyResults.map(kr => {
          if (kr.id === targetKeyResultId) {
            const newActionItem: ActionItem = { id: uuidv4(), title: newItemTitle, isCompleted: false, dueDate: itemDueDate };
            return { ...kr, actionItems: [...kr.actionItems, newActionItem] };
          }
          return kr;
        });

        const success = await updateObjectiveInDB(targetObjectiveId, { keyResults: updatedKeyResults });
        if (success) {
          setObjectives(prev =>
            prev.map(obj =>
              obj.id === targetObjectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
            )
          );
        }
      }
      closeModal();
    } catch (error) {
      console.error(`Error adding ${modalType}:`, error);
    }
  };

  // --- CRUD Operations (modified to use modal) ---
  const deleteObjective = async (id: string) => {
    if (!user) return;
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
    if (!user) return;
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

  const deleteKeyResult = async (objectiveId: string, keyResultId: string) => {
    if (!user) return;
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
  
  const toggleActionItemCompletion = async (objectiveId: string, keyResultId: string, actionItemId: string) => {
    if (!user) return;
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
    if (!user) return;
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
    if (!user) return;
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
    if (!user) return;
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

    // Sort objectives by due date
    const sortedObjectives = newObjectives.sort((a, b) => {
      // Objectives with no due date go to the end
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      // Sort by date ascending
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    if (JSON.stringify(sortedObjectives) !== JSON.stringify(objectives)) {
        setObjectives(sortedObjectives);
    }
  }, [objectives]);

  // Derived state for analytics
  const { totalObjectives, avgProgress, completedObjectives } = useMemo(() => {
    const total = objectives.length;
    const completed = objectives.filter(obj => obj.progress === 100).length;
    const totalProgressSum = objectives.reduce((sum, obj) => sum + obj.progress, 0);
    const average = total > 0 ? Math.round(totalProgressSum / total) : 0;

    return {
      totalObjectives: total,
      avgProgress: average,
      completedObjectives: completed,
    };
  }, [objectives]);

  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Objectives Dashboard</h1>
        <p className="text-gray-600 mb-8 text-center">Please sign in to manage your objectives.</p>
        <button 
          onClick={signInWithGoogle} 
          className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
        >
          <LogIn size={20} className="mr-2" /> Sign in with Google
        </button>
      </div>
    );
  }

  const getAvgProgressColorClass = (progress: number) => {
    if (progress > 70) return 'text-green-500';
    if (progress > 30) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getDueDateDisplay = (dueDate?: string) => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Normalize due date to midnight

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dateText = '';
    let textColorClass = 'text-gray-500'; // Default future dates

    if (diffDays < 0) {
      dateText = `Overdue`;
      textColorClass = 'text-red-500';
    } else if (diffDays === 0) {
      dateText = 'Today';
      textColorClass = 'text-red-500';
    } else if (diffDays > 0) {
      dateText = `D-${diffDays}`;
      textColorClass = 'text-gray-500';
    }

    return (
      <span className={`text-xs ml-2 font-medium ${textColorClass}`}>
        {dueDate} ({dateText})
      </span>
    );
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'OBJECTIVE':
        return 'New Objective';
      case 'KEY_RESULT':
        return 'New Key Result';
      case 'ACTION_ITEM':
        return 'New Action Item';
      default:
        return 'Add Item';
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50 shadow-lg p-4 relative pb-20 font-sans">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Objectives</h1>
          <p className="text-gray-500">Your roadmap to success.</p>
        </div>
        <div className="flex items-center">
          {user.displayName && <span className="text-gray-700 mr-2 hidden sm:block">Hello, {user.displayName}</span>}
          <button 
            onClick={signOutUser} 
            className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-all"
            aria-label="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-sm rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Total Objectives</p>
          <p className="text-2xl font-bold text-gray-800">{totalObjectives}</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Average Progress</p>
          <p className={`text-2xl font-bold ${getAvgProgressColorClass(avgProgress)}`}>{avgProgress}%</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-gray-800">{completedObjectives}</p>
        </div>
      </div>

      <div>
        {objectives.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No objectives found. Add your first objective!</p>
        ) : (
          objectives.map((objective) => (
            <div key={objective.id} className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                 <div className="flex items-center justify-between">
                  {editingId === objective.id ? (
                    <div className="flex-grow flex items-center">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)} // Changed to newItemTitle
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
                          {getDueDateDisplay(objective.dueDate)}
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
                              {getDueDateDisplay(kr.dueDate)}
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
                                          {getDueDateDisplay(ai.dueDate)}
                                      </div>
                                      <button onClick={() => deleteActionItem(objective.id, kr.id, ai.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                                  </div>
                              ))}
                              <button onClick={() => openModal('ACTION_ITEM', objective.id, kr.id)} className="text-sm text-blue-500 hover:text-blue-600 mt-2">+ Add Action Item</button>
                          </div>
                      )}
                    </div>
                  ))}
                  <button onClick={() => openModal('KEY_RESULT', objective.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-700 mt-3">+ Add Key Result</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => openModal('OBJECTIVE')}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
        aria-label="Add Objective"
      >
        <Plus size={24} />
      </button>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{getModalTitle()}</h2>
            <div className="mb-4">
              <label htmlFor="itemTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="itemTitle"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Enter title"
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label htmlFor="itemDueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input
                type="date"
                id="itemDueDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={newItemDate}
                onChange={(e) => setNewItemDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;