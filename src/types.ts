export interface ActionItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface KeyResult {
  id: string;
  title: string;
  progress: number; // 0-100
  actionItems: ActionItem[];
}

export interface Objective {
  id: string;
  title: string;
  progress: number; // 0-100
  keyResults: KeyResult[];
}
