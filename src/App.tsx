import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import type { Objective, KeyResult, ActionItem, ModalType } from './types';
import { Plus, LogOut } from 'lucide-react';
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
import EditModal from './components/EditModal';

// Dynamically import components
const Auth = lazy(() => import('./components/Auth'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ObjectiveList = lazy(() => import('./components/ObjectiveList'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);

function App() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [targetObjectiveId, setTargetObjectiveId] = useState<string | null>(null);
  const [targetKeyResultId, setTargetKeyResultId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [initialTitle, setInitialTitle] = useState('');
  const [initialStartDate, setInitialStartDate] = useState('');
  const [initialDueDate, setInitialDueDate] = useState('');

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

  const compareByDate = (a: { dueDate?: string | null }, b: { dueDate?: string | null }) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return dateA - dateB;
  };

  const openModal = (type: ModalType, objId: string | null = null, krId: string | null = null) => {
    setModalType(type);
    setTargetObjectiveId(objId);
    setTargetKeyResultId(krId);
    setEditingItemId(null);
    setInitialTitle('');
    setInitialStartDate('');
    setInitialDueDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (type: ModalType, item: Objective | KeyResult | ActionItem, objectiveId?: string, keyResultId?: string) => {
    setModalType(type);
    setTargetObjectiveId(objectiveId || null);
    setTargetKeyResultId(keyResultId || null);
    setEditingItemId(item.id);
    setInitialTitle(item.title);
    setInitialStartDate(item.startDate || '');
    setInitialDueDate(item.dueDate || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveItem = async (title: string, startDate: string, dueDate: string) => {
    if (!user || !title.trim()) {
      alert("Title cannot be empty!");
      return;
    }

    const itemStartDate: string | null = startDate.trim() === '' ? null : startDate;
    const itemDueDate: string | null = dueDate.trim() === '' ? null : dueDate;

    try {
      if (editingItemId) { // --- UPDATE MODE ---
        if (modalType === 'OBJECTIVE') {
          await updateObjectiveInDB(editingItemId, { title, startDate: itemStartDate, dueDate: itemDueDate });
          setObjectives(prev => prev.map(obj => obj.id === editingItemId ? { ...obj, title, startDate: itemStartDate, dueDate: itemDueDate } : obj));
        } else if (modalType === 'KEY_RESULT' && targetObjectiveId) {
          const objectiveToUpdate = objectives.find(obj => obj.id === targetObjectiveId);
          if (!objectiveToUpdate) return;

          const updatedKeyResults = objectiveToUpdate.keyResults.map(kr =>
            kr.id === editingItemId ? { ...kr, title, startDate: itemStartDate, dueDate: itemDueDate } : kr
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
                ai.id === editingItemId ? { ...ai, title, dueDate: itemDueDate, startDate: itemStartDate } : ai
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
          const newId = await addObjectiveToDB(title, user.uid, itemStartDate || undefined, itemDueDate || undefined);
          if (newId) {
            const newObjective: Objective = {
              id: newId,
              userId: user.uid,
              title,
              progress: 0,
              keyResults: [],
              isOpen: true,
              startDate: itemStartDate,
              dueDate: itemDueDate,
            };
            setObjectives(prev => [...prev, newObjective]);
          }
        } else if (modalType === 'KEY_RESULT' && targetObjectiveId) {
          const objective = objectives.find(o => o.id === targetObjectiveId);
          if (!objective) return;

          const newKeyResult: KeyResult = {
            id: uuidv4(),
            title,
            progress: 0,
            actionItems: [],
            isOpen: true,
            startDate: itemStartDate,
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
              const newActionItem: ActionItem = { id: uuidv4(), title, isCompleted: false, dueDate: itemDueDate, startDate: itemStartDate };
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

  const deleteObjective = async (id: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this objective?')) {
      try {
        await deleteObjectiveFromDB(id);
        setObjectives(prev => prev.filter(objective => objective.id !== id));
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
      await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });

      setObjectives(prev =>
        prev.map(obj =>
          obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
        )
      );
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

    await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });
    setObjectives(prev =>
      prev.map(obj =>
        obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
      )
    );
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

    await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });
    setObjectives(prev =>
      prev.map(obj =>
        obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
      )
    );
  };

  const toggleObjectiveOpen = async (id: string) => {
    const objective = objectives.find(o => o.id === id);
    if (!objective) return;
    await updateObjectiveInDB(id, { isOpen: !objective.isOpen });
    setObjectives(prev =>
      prev.map(obj =>
        obj.id === id ? { ...obj, isOpen: !obj.isOpen } : obj
      )
    );
  };

  const toggleKeyResultOpen = async (objectiveId: string, keyResultId: string) => {
    const objective = objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    const updatedKeyResults = objective.keyResults.map(kr =>
      kr.id === keyResultId ? { ...kr, isOpen: !kr.isOpen } : kr
    );

    await updateObjectiveInDB(objectiveId, { keyResults: updatedKeyResults });
    setObjectives(prev =>
      prev.map(obj =>
        obj.id === objectiveId ? { ...obj, keyResults: updatedKeyResults } : obj
      )
    );
  };

  const memoizedObjectives = useMemo(() => {
    return objectives.map(objective => {
      const keyResultsWithProgress = objective.keyResults.map(kr => {
        const completed = kr.actionItems.filter(ai => ai.isCompleted).length;
        const total = kr.actionItems.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { ...kr, progress, actionItems: [...kr.actionItems].sort(compareByDate) };
      }).sort(compareByDate);

      const totalProgress = keyResultsWithProgress.reduce((sum, kr) => sum + kr.progress, 0);
      const overallProgress = keyResultsWithProgress.length > 0 ? Math.round(totalProgress / keyResultsWithProgress.length) : 0;

      return { ...objective, progress: overallProgress, keyResults: keyResultsWithProgress };
    }).sort(compareByDate);
  }, [objectives]);

  if (loadingAuth) {
    return <LoadingSpinner />;
  }

  const getModalTitle = () => {
    const baseTitle = editingItemId ? 'Edit' : 'New';
    switch (modalType) {
      case 'OBJECTIVE': return `${baseTitle} Objective`;
      case 'KEY_RESULT': return `${baseTitle} Key Result`;
      case 'ACTION_ITEM': return `${baseTitle} Action Item`;
      default: return `${baseTitle} Item`;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {!user ? (
        <Auth onLogin={signInWithGoogle} loading={loadingAuth} />
      ) : (
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

          <EditModal 
            isOpen={isModalOpen}
            onClose={closeModal}
            onSave={handleSaveItem}
            modalTitle={getModalTitle()}
            initialTitle={initialTitle}
            initialStartDate={initialStartDate}
            initialDueDate={initialDueDate}
          />

        </div>
      )}
    </Suspense>
  );
}

export default App;
