import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import type { Objective } from '../types';

const objectivesCollectionRef = collection(db, 'Objectives');

export const fetchObjectives = async (userId: string): Promise<Objective[]> => {
  console.log('Fetching objectives from Firestore for user:', userId);
  try {
    const q = query(objectivesCollectionRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const objectives = querySnapshot.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId,
      title: doc.data().title,
      progress: doc.data().progress || 0,
      keyResults: doc.data().keyResults || [],
      isOpen: doc.data().isOpen || false,
      dueDate: doc.data().dueDate || undefined, // Map dueDate
    })) as Objective[];
    console.log('Objectives fetched successfully:', objectives);
    return objectives;
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return []; // Return an empty array on error
  }
};

export const addObjectiveToDB = async (title: string, userId: string, dueDate?: string): Promise<string> => {
  console.log('Adding objective to Firestore:', { title, userId, dueDate });
  try {
    const newObjectiveRef = await addDoc(objectivesCollectionRef, {
      title,
      userId,
      keyResults: [],
      progress: 0,
      isOpen: false,
      ...(dueDate && { dueDate }), // Conditionally add dueDate
    });
    console.log('Objective added successfully with ID:', newObjectiveRef.id);
    return newObjectiveRef.id;
  } catch (error) {
    console.error('Error adding objective:', error);
    return ''; // Return empty string on error
  }
};
export const deleteObjectiveFromDB = async (id: string): Promise<boolean> => {
  console.log('Deleting objective from Firestore with ID:', id);
  try {
    const docRef = doc(db, 'Objectives', id);
    await deleteDoc(docRef);
    console.log('Objective deleted successfully:', id);
    return true;
  } catch (error) {
    console.error('Error deleting objective:', error);
    return false;
  }
};

export const updateObjectiveInDB = async (id: string, data: Partial<Objective>): Promise<boolean> => {
  console.log('Updating objective in Firestore with ID:', id, 'Data:', data);
  try {
    const docRef = doc(db, 'Objectives', id);
    await updateDoc(docRef, data as { [key: string]: any });
    console.log('Objective updated successfully:', id);
    return true;
  } catch (error) {
    console.error('Error updating objective:', error);
    return false;
  }
};