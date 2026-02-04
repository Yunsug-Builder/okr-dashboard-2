import { useState } from 'react';
import './App.css'
import type { Objective, KeyResult, ActionItem } from './types';
import { ChevronDown, ChevronUp } from 'lucide-react';

function App() {
  const [isObjectiveExpanded, setIsObjectiveExpanded] = useState(true);
  const [expandedKeyResultIds, setExpandedKeyResultIds] = useState<string[]>([]);

  const dummyObjective: Objective = {
    id: 'obj-1',
    title: 'Become a Senior Frontend Engineer',
    progress: 60,
    keyResults: [
      {
        id: 'kr-1',
        title: 'Complete 5 complex React projects',
        progress: 80,
        actionItems: [
          { id: 'ai-1-1', title: 'Build a dashboard application', isCompleted: true },
          { id: 'ai-1-2', title: 'Develop an e-commerce site', isCompleted: true },
          { id: 'ai-1-3', title: 'Create a real-time chat application', isCompleted: false },
        ],
      },
      {
        id: 'kr-2',
        title: 'Master advanced TypeScript concepts',
        progress: 40,
        actionItems: [
          { id: 'ai-2-1', title: 'Read "Effective TypeScript" book', isCompleted: true },
          { id: 'ai-2-2', title: 'Implement generic utility types', isCompleted: false },
        ],
      },
    ],
  };

  const toggleKeyResult = (id: string) => {
    setExpandedKeyResultIds(prev =>
      prev.includes(id)
        ? prev.filter(krId => krId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50 shadow-lg p-4">
      {/* Objective Card */}
      <div 
        className="bg-white rounded-xl p-4 shadow-sm mb-4 cursor-pointer transition-all hover:shadow-md"
        onClick={() => setIsObjectiveExpanded(!isObjectiveExpanded)}
      >
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold">{dummyObjective.title}</h2>
          {isObjectiveExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${dummyObjective.progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{dummyObjective.progress}% Complete</p>
      </div>

      {/* Key Results List */}
      {isObjectiveExpanded && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {dummyObjective.keyResults.map((kr) => {
            const isExpanded = expandedKeyResultIds.includes(kr.id);
            return (
              <div 
                key={kr.id} 
                className="bg-white rounded-xl p-4 shadow-sm transition-all"
              >
                {/* Key Result Header */}
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleKeyResult(kr.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{kr.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{kr.progress}% Complete</p>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                </div>

                {/* Action Items List */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <ul className="space-y-2">
                      {kr.actionItems.map((ai) => (
                        <li key={ai.id} className="flex items-center text-sm text-gray-700">
                          <input 
                            type="checkbox" 
                            checked={ai.isCompleted} 
                            readOnly 
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3"
                          />
                          <span className={ai.isCompleted ? 'line-through text-gray-400' : ''}>
                            {ai.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default App
