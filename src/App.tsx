import { useState, useEffect, useMemo } from 'react';
import type { Objective, KeyResult, ActionItem } from './types';
import { Plus, Trash2, ChevronDown, ChevronRight, Edit, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Used for generating unique IDs for new items
import { 
  fetchObjectives, 
  addObjectiveToDB, 
  deleteObjectiveFromDB,
  updateObjectiveInDB 
} from './services/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { app } from './firebase'; // Assuming 'app' is exported from firebase.ts
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ObjectiveList from './components/ObjectiveList';



function App() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Modal State - for custom add/edit forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [targetObjectiveId, setTargetObjectiveId] = useState<string | null>(null); // Parent for KRs/AIs
  const [targetKeyResultId, setTargetKeyResultId] = useState<string | null>(null);   // Parent for AIs
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // ID of item being edited

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
        setObjectives([]); // Clear objectives if user logs out or is null
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

  // Helper function to compare items by dueDate
  const compareByDate = (a: { dueDate?: string }, b: { dueDate?: string }) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

    if (dateA === dateB) {
      return 0; // Maintain original order if dates are the same (or sort by creation if needed)
    }
    return dateA - dateB; // Sort by date ascending (earliest first)
  };


  // --- Modal Handlers ---
  const openModal = (type: ModalType, objId: string | null = null, krId: string | null = null) => {
    setModalType(type);
    setTargetObjectiveId(objId);
    setTargetKeyResultId(krId);
    setNewItemTitle('');
    setNewItemDate('');
    setEditingItemId(null); // Ensure this is null for creation
    setIsModalOpen(true);
  };

  const openEditModal = (type: ModalType, item: Objective | KeyResult | ActionItem, objectiveId?: string, keyResultId?: string) => {
    setModalType(type);
    setTargetObjectiveId(objectiveId || null);
    setTargetKeyResultId(keyResultId || null);
    setEditingItemId(item.id);
    setNewItemTitle(item.title);
    setNewItemDate(item.dueDate || ''); // Pre-fill due date
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setTargetObjectiveId(null);
    setTargetKeyResultId(null);
    setNewItemTitle('');
    setNewItemDate('');
    setEditingItemId(null); // Reset editing item ID
  };

  const handleSaveItem = async () => {
    if (!user || !newItemTitle.trim()) {
      alert("Title cannot be empty!");
      return;
    }

    const itemDueDate = newItemDate.trim() === '' ? undefined : newItemDate;

    try {
      if (editingItemId) { // --- UPDATE MODE ---
        if (modalType === 'OBJECTIVE') {
          await updateObjectiveInDB(editingItemId, { title: newItemTitle, dueDate: itemDueDate });
          setObjectives(prev => prev.map(obj => obj.id === editingItemId ? { ...obj, title: newItemTitle, dueDate: itemDueDate } : obj));
        } else if (modalType === 'KEY_RESULT' && targetObjectiveId) {
          const objectiveToUpdate = objectives.find(obj => obj.id === targetObjectiveId);
          if (!objectiveToUpdate) return;

          const updatedKeyResults = objectiveToUpdate.keyResults.map(kr =>
            kr.id === editingItemId ? { ...kr, title: newItemTitle, dueDate: itemDueDate } : kr
          );
          await updateObjectiveInDB(targetObjectiveId, { keyResults: updatedKeyResults });
          setObjectives(prev => prev.map(obj =>
            obj.id === targetObjectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
          ));
        } else if (modalType === 'ACTION_ITEM' && targetObjectiveId && targetKeyResultId) {
          const objectiveToUpdate = objectives.find(obj => obj.id === targetObjectiveId);
          if (!objectiveToUpdate) return;

          const updatedKeyResults = objectiveToUpdate.keyResults.map(kr => {
            if (kr.id === targetKeyResultId) {
              const updatedActionItems = kr.actionItems.map(ai =>
                ai.id === editingItemId ? { ...ai, title: newItemTitle, dueDate: itemDueDate } : ai
              );
              return { ...kr, actionItems: updatedActionItems };
            }
            return kr;
          });
          await updateObjectiveInDB(targetObjectiveId, { keyResults: updatedKeyResults });
          setObjectives(prev => prev.map(obj =>
            obj.id === targetObjectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
          ));
        }
      } else { // --- CREATE MODE ---
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
          await updateObjectiveInDB(targetObjectiveId, { keyResults: updatedKeyResults });

          setObjectives(prev =>
            prev.map(obj =>
              obj.id === targetObjectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
            )
          );
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

          await updateObjectiveInDB(targetObjectiveId, { keyResults: updatedKeyResults });
          setObjectives(prev =>
            prev.map(obj =>
              obj.id === targetObjectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
            )
          );
        }
      }
      closeModal();
    } catch (error) {
      console.error(`Error saving ${modalType}:`, error);
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
  
  const memoizedObjectives = useMemo(() => {
    const objectivesWithProgressAndSorted = objectives.map(objective => {
      // Calculate progress and sort ActionItems within each KeyResult
      const keyResultsWithProgressAndSorted = objective.keyResults.map(kr => {
        if (!kr.actionItems || kr.actionItems.length === 0) {
            return { ...kr, progress: 0, actionItems: [] };
        }
        const completed = kr.actionItems.filter(ai => ai.isCompleted).length;
        const total = kr.actionItems.length;
        const progress = Math.round((completed / total) * 100);
        
        // Sort ActionItems
        const sortedActionItems = [...kr.actionItems].sort(compareByDate);

        return { ...kr, progress, actionItems: sortedActionItems };
      }).sort(compareByDate); // Sort KeyResults

      if (!keyResultsWithProgressAndSorted || keyResultsWithProgressAndSorted.length === 0) {
        return { ...objective, progress: 0, keyResults: [] };
      }

      const totalProgress = keyResultsWithProgressAndSorted.reduce((sum, kr) => sum + kr.progress, 0);
      const overallProgress = Math.round(totalProgress / keyResultsWithProgressAndSorted.length);
      
      return { ...objective, progress: overallProgress, keyResults: keyResultsWithProgressAndSorted };
    });

    // Sort the main objectives array
    const sortedObjectives = [...objectivesWithProgressAndSorted].sort(compareByDate);

    return sortedObjectives;
  }, [objectives]);



  if (loadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={signInWithGoogle} loading={loadingAuth} />;
  }



  const getModalTitle = () => {
    const baseTitle = editingItemId ? 'Edit' : 'New';
    switch (modalType) {
      case 'OBJECTIVE':
        return `${baseTitle} Objective`;
      case 'KEY_RESULT':
        return `${baseTitle} Key Result`;
      case 'ACTION_ITEM':
        return `${baseTitle} Action Item`;
      default:
        return `${baseTitle} Item`;
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

      <Dashboard objectives={memoizedObjectives} />

            <ObjectiveList
              objectives={memoizedObjectives}
              onAdd={openModal}
              onEdit={openEditModal}
              onDeleteObjective={deleteObjective}
              onDeleteKeyResult={deleteKeyResult}
              onToggleActionItemCompletion={toggleActionItemCompletion}
              onDeleteActionItem={deleteActionItem}
              onToggleObjectiveOpen={toggleObjectiveOpen}
              onToggleKeyResultOpen={toggleKeyResultOpen}
            />
      <button
        onClick={() => openModal('OBJECTIVE')}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
        aria-label="Add Objective"
      >
        <Plus size={24} />
      </button>

      {/* Add/Edit Item Modal */}
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