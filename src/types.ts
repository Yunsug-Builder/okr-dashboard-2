export interface ActionItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface KeyResult {
  id: string;
  title: string;
  progress: number;
  actionItems: ActionItem[];
  isOpen?: boolean; // <--- 이 친구가 없어서 에러가 났던 겁니다! (?: 있어도 되고 없어도 됨)
}

export interface Objective {
  id: string;
  userId: string;
  title: string;
  progress: number;
  keyResults: KeyResult[];
  isOpen?: boolean; // 목표에도 isOpen이 필요합니다.
}
