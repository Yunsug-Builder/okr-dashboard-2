export const getDDay = (dateString?: string | Date): { text: string; colorClass: string } | null => {
  if (!dateString) return null;

  const today = new Date();
  const dueDate = new Date(dateString);
  // Compare dates only, ignoring time
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `D+${Math.abs(diffDays)}`, colorClass: 'bg-gray-100 text-gray-600' };
  } else if (diffDays === 0) {
    return { text: 'D-Day', colorClass: 'bg-red-100 text-red-600' };
  } else {
    return { text: `D-${diffDays}`, colorClass: 'bg-blue-100 text-blue-600' };
  }
};
