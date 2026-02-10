import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import type { Objective, KeyResult, ActionItem, ModalType } from './types';
import { Plus, LogOut } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import {
  fetchObjectives,
  addObjectiveToDB,
  deleteObjectiveFromDB,
  updateObjectiveInDB
} from './services/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { app } from './firebase';
import EditModal from './components/EditModal';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { ObjectiveContext } from './contexts/ObjectiveContext';

const Auth = lazy(() => import('./components/Auth'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ObjectiveList = lazy(() => import('./components/ObjectiveList'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
  </div>
);

type DndItem = Objective | KeyResult | ActionItem;

interface FindResult {
    container: DndItem[];
    index: number;
}

function App() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(uuidv4());
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [currentObjId, setCurrentObjId] = useState<string | null>(null);
  const [currentKrId, setCurrentKrId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [initialTitle, setInitialTitle] = useState('');
  const [initialStartDate, setInitialStartDate] = useState('');
  const [initialDueDate, setInitialDueDate] = useState('');

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const openModal = (type: ModalType, objId: string | null = null, krId: string | null = null) => {
    setModalType(type);
    setCurrentObjId(objId);
    setCurrentKrId(krId);
    setEditingItemId(null);
    setInitialTitle('');
    setInitialStartDate('');
    setInitialDueDate('');
    setModalKey(uuidv4());
    setIsModalOpen(true);
  };

  const openEditModal = (type: ModalType, item: Objective | KeyResult | ActionItem, objectiveId?: string, keyResultId?: string) => {
    setModalType(type);
    setCurrentObjId(objectiveId || null);
    setCurrentKrId(keyResultId || null);
    setEditingItemId(item.id);
    setInitialTitle(item.title);
    setInitialStartDate(item.startDate || '');
    setInitialDueDate(item.dueDate || '');
    setModalKey(item.id);
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
    setIsSaving(true);

    const itemStartDate: string | null = startDate.trim() === '' ? null : startDate;
    const itemDueDate: string | null = dueDate.trim() === '' ? null : dueDate;

    try {
      if (editingItemId) { // --- UPDATE MODE ---
        let objectiveToUpdate: Objective | undefined;
        if (modalType === 'OBJECTIVE') {
            objectiveToUpdate = objectives.find(obj => obj.id === editingItemId);
            if(objectiveToUpdate){
                const updatedObjective = { ...objectiveToUpdate, title, startDate: itemStartDate, dueDate: itemDueDate };
                await updateObjectiveInDB(editingItemId, updatedObjective);
                setObjectives(prev => prev.map(obj => obj.id === editingItemId ? updatedObjective : obj));
            }
        } else if (modalType === 'KEY_RESULT' && currentObjId) {
            objectiveToUpdate = objectives.find(obj => obj.id === currentObjId);
            if (!objectiveToUpdate) return;
            const updatedKeyResults = objectiveToUpdate.keyResults.map(kr =>
                kr.id === editingItemId ? { ...kr, title, startDate: itemStartDate, dueDate: itemDueDate } : kr
            );
            await updateObjectiveInDB(currentObjId, { keyResults: updatedKeyResults });
            setObjectives(prev => prev.map(obj =>
                obj.id === currentObjId ? { ...obj, keyResults: updatedKeyResults } : obj
            ));

        } else if (modalType === 'ACTION_ITEM' && currentObjId && currentKrId) {
            objectiveToUpdate = objectives.find(obj => obj.id === currentObjId);
            if (!objectiveToUpdate) return;

            const updatedKeyResults = objectiveToUpdate.keyResults.map(kr => {
                if (kr.id === currentKrId) {
                    const updatedActionItems = kr.actionItems.map(ai =>
                        ai.id === editingItemId ? { ...ai, title, dueDate: itemDueDate, startDate: itemStartDate } : ai
                    );
                    return { ...kr, actionItems: updatedActionItems };
                }
                return kr;
            });
            await updateObjectiveInDB(currentObjId, { keyResults: updatedKeyResults });
            setObjectives(prev => prev.map(obj =>
                obj.id === currentObjId ? { ...obj, keyResults: updatedKeyResults } : obj
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
        } else if (modalType === 'KEY_RESULT' && currentObjId) {
          const objective = objectives.find(o => o.id === currentObjId);
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
          await updateObjectiveInDB(currentObjId, { keyResults: updatedKeyResults });

          setObjectives(prev =>
            prev.map(obj =>
              obj.id === currentObjId ? { ...obj, keyResults: updatedKeyResults } : obj
            )
          );
        } else if (modalType === 'ACTION_ITEM' && currentObjId && currentKrId) {
          const objective = objectives.find(o => o.id === currentObjId);
          if (!objective) return;

          const updatedKeyResults = objective.keyResults.map(kr => {
            if (kr.id === currentKrId) {
              const newActionItem: ActionItem = { id: uuidv4(), title, isCompleted: false, dueDate: itemDueDate, startDate: itemStartDate };
              return { ...kr, actionItems: [...kr.actionItems, newActionItem] };
            }
            return kr;
          });

          await updateObjectiveInDB(currentObjId, { keyResults: updatedKeyResults });
          setObjectives(prev =>
            prev.map(obj =>
              obj.id === currentObjId ? { ...obj, keyResults: updatedKeyResults } : obj
            )
          );
        }
      }
      closeModal();
    } catch (error) {
      console.error(`Error saving ${modalType}:`, error);
    } finally {
      setIsSaving(false);
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
    setObjectives(prev =>
      prev.map(obj =>
        obj.id === id ? { ...obj, isOpen: !obj.isOpen } : obj
      )
    );
  };

  const toggleKeyResultOpen = async (objectiveId: string, keyResultId: string) => {
    setObjectives(prev =>
      prev.map(obj => {
        if (obj.id === objectiveId) {
          const updatedKeyResults = obj.keyResults.map(kr =>
            kr.id === keyResultId ? { ...kr, isOpen: !kr.isOpen } : kr
          );
          return { ...obj, keyResults: updatedKeyResults };
        }
        return obj;
      })
    );
  };
  
  const contextValue = {
    onToggleObjective: toggleObjectiveOpen,
    onAddKeyResult: (objectiveId: string) => openModal('KEY_RESULT', objectiveId),
    onDeleteObjective: deleteObjective,
    onEditObjective: (objective: Objective) => openEditModal('OBJECTIVE', objective, objective.id),
    onAddActionItem: (objectiveId: string, keyResultId: string) => openModal('ACTION_ITEM', objectiveId, keyResultId),
    onDeleteKeyResult: deleteKeyResult,
    onEditKeyResult: (objectiveId: string, keyResult: KeyResult) => openEditModal('KEY_RESULT', keyResult, objectiveId, keyResult.id),
    onToggleKeyResult: toggleKeyResultOpen,
    onToggleActionItem: toggleActionItemCompletion,
    onDeleteActionItem: deleteActionItem,
    onEditActionItem: (objectiveId: string, keyResultId: string, actionItem: ActionItem) => openEditModal('ACTION_ITEM', actionItem, objectiveId, keyResultId),
  };

  const memoizedObjectives = useMemo(() => {
    return objectives.map(objective => {
      const keyResultsWithProgress = objective.keyResults.map(kr => {
        const completed = kr.actionItems.filter(ai => ai.isCompleted).length;
        const total = kr.actionItems.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { ...kr, progress, actionItems: [...kr.actionItems] };
      });

      const totalProgress = keyResultsWithProgress.reduce((sum, kr) => sum + kr.progress, 0);
      const overallProgress = keyResultsWithProgress.length > 0 ? Math.round(totalProgress / keyResultsWithProgress.length) : 0;

      return { ...objective, progress: overallProgress, keyResults: keyResultsWithProgress };
    });
  }, [objectives]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        setObjectives((prevObjectives) => {
            const newObjectives = JSON.parse(JSON.stringify(prevObjectives));

            const findItemsAndIndices = (items: DndItem[], id: string): FindResult | null => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === id) return { container: items, index: i };
                    const currentItem = items[i];
                    if ("keyResults" in currentItem && Array.isArray((currentItem as Objective).keyResults)) {
                        const result: FindResult | null = findItemsAndIndices((currentItem as Objective).keyResults, id);
                        if (result) return result;
                    }
                    if ("actionItems" in currentItem && Array.isArray((currentItem as KeyResult).actionItems)) {
                        const result: FindResult | null = findItemsAndIndices((currentItem as KeyResult).actionItems, id);
                        if (result) return result;
                    }
                }
                return null;
            }

            const activeResult = findItemsAndIndices(newObjectives, active.id as string);
            const overResult = findItemsAndIndices(newObjectives, over.id as string);

            if (activeResult && overResult && activeResult.container === overResult.container) {
                const { container, index: oldIndex } = activeResult;
                const { index: newIndex } = overResult;
                
                const [movedItem] = container.splice(oldIndex, 1);
                container.splice(newIndex, 0, movedItem);

                return newObjectives;
            }

            return prevObjectives;
        });
    }
  };

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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                
                <ObjectiveContext.Provider value={contextValue}>
                    <ObjectiveList objectives={memoizedObjectives} />
                </ObjectiveContext.Provider>

                <button
                    onClick={() => openModal('OBJECTIVE')}
                    disabled={isSaving}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Add Objective"
                >
                  {isSaving ? (
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Plus size={24} />
                  )}
                </button>

                <EditModal
                    key={modalKey}
                    isOpen={isModalOpen}
                    isSaving={isSaving}
                    onClose={closeModal}
                    onSave={handleSaveItem}
                    modalTitle={getModalTitle()}
                    initialTitle={initialTitle}
                    initialStartDate={initialStartDate}
                    initialDueDate={initialDueDate}
                />

            </div>
        </DndContext>
      )}
    </Suspense>
  );
}

export default App;
