import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import type { Objective } from '../types';

const objectivesCollectionRef = collection(db, 'Objectives');

export const fetchObjectives = async (): Promise<Objective[]> => {
  console.log('Fetching objectives from Firestore...');
  try {
    const querySnapshot = await getDocs(objectivesCollectionRef);
    const objectives = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      progress: doc.data().progress || 0,
      keyResults: doc.data().keyResults || [],
      isOpen: doc.data().isOpen || false,
    })) as Objective[];
    console.log('Objectives fetched successfully:', objectives);
    return objectives;
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return []; // Return an empty array on error
  }
};

export const addObjectiveToDB = async (title: string): Promise<string> => {
  console.log('Adding objective to Firestore:', { title });
  try {
    const newObjectiveRef = await addDoc(objectivesCollectionRef, {
      title,
      keyResults: [],
      progress: 0,
      isOpen: false,
    });
    console.log('Objective added successfully with ID:', newObjectiveRef.id);
    return newObjectiveRef.id;
  } catch (error) {
    console.error('Error adding objective:', error);
    return ''; // Return empty string on error
  }
};
