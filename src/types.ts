export type ModalType = 'OBJECTIVE' | 'KEY_RESULT' | 'ACTION_ITEM';

export interface ActionItem {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  startDate: string | null;
}

export interface KeyResult {
  id: string;
  title: string;
  progress: number;
  actionItems: ActionItem[];
  isOpen?: boolean;
  dueDate: string | null;
  startDate: string | null;
}

export interface Objective {
  id: string;
  userId: string;
  title: string;
  progress: number;
  keyResults: KeyResult[];
  isOpen?: boolean;
  dueDate: string | null;
  startDate: string | null;
}
