import React, { useMemo } from 'react';
import type { Objective } from '../types';

interface DashboardProps {
  objectives: Objective[];
}

const Dashboard: React.FC<DashboardProps> = ({ objectives }) => {
  // Derived state for analytics
  const { totalObjectives, avgProgress, completedObjectives } = useMemo(() => {
    const total = objectives.length;
    const completed = objectives.filter(obj => obj.progress === 100).length;
    const totalProgressSum = objectives.reduce((sum, obj) => sum + obj.progress, 0);
    const average = total > 0 ? Math.round(totalProgressSum / total) : 0;

    return {
      totalObjectives: total,
      avgProgress: average,
      completedObjectives: completed,
    };
  }, [objectives]);

  const getAvgProgressColorClass = (progress: number) => {
    if (progress > 70) return 'text-green-500';
    if (progress > 30) return 'text-yellow-500';
    return 'text-gray-500';
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white shadow-sm rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">Total Objectives</p>
        <p className="text-2xl font-bold text-gray-800">{totalObjectives}</p>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">Average Progress</p>
        <p className={`text-2xl font-bold ${getAvgProgressColorClass(avgProgress)}`}>{avgProgress}%</p>
      </div>
      <div className="bg-white shadow-sm rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">Completed</p>
        <p className="text-2xl font-bold text-gray-800">{completedObjectives}</p>
      </div>
    </div>
  );
};

export default Dashboard;
