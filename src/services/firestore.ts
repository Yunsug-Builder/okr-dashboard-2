import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import type { Objective } from '../types';

const objectivesCollectionRef = collection(db, 'Objectives');

export const fetchObjectives = async (): Promise<Objective[]> => {
  const querySnapshot = await getDocs(objectivesCollectionRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    title: doc.data().title,
    progress: doc.data().progress || 0, // Initialize progress if not present
    keyResults: doc.data().keyResults || [], // Initialize as empty array if not present
    isOpen: doc.data().isOpen || false, // Assuming isOpen might be a field
  })) as Objective[];
};

export const addObjectiveToDB = async (title: string): Promise<string> => {
  const newObjectiveRef = await addDoc(objectivesCollectionRef, {
    title,
    keyResults: [],
    progress: 0,
    isOpen: false,
  });
  return newObjectiveRef.id;
};
