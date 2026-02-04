import { useState } from 'react';
import type { Objective } from './types';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

function App() {
  const [isObjectiveExpanded, setIsObjectiveExpanded] = useState(true);
  const [expandedKeyResultIds, setExpandedKeyResultIds] = useState<string[]>([]);

  // Initial dummy data for objectives
  const initialObjective: Objective = {
    id: uuidv4(), // Use uuid for the initial objective as well
    title: 'Become a Senior Frontend Engineer',
    progress: 60,
    keyResults: [
      {
        id: uuidv4(),
        title: 'Complete 5 complex React projects',
        progress: 80,
        actionItems: [
          { id: uuidv4(), title: 'Build a dashboard application', isCompleted: true },
          { id: uuidv4(), title: 'Develop an e-commerce site', isCompleted: true },
          { id: uuidv4(), title: 'Create a real-time chat application', isCompleted: false },
        ],
      },
      {
        id: uuidv4(),
        title: 'Master advanced TypeScript concepts',
        progress: 40,
        actionItems: [
          { id: uuidv4(), title: 'Read "Effective TypeScript" book', isCompleted: true },
          { id: uuidv4(), title: 'Implement generic utility types', isCompleted: false },
        ],
      },
    ],
  };

  const [objectives, setObjectives] = useState<Objective[]>([initialObjective]);

  const toggleKeyResult = (id: string) => {
    setExpandedKeyResultIds(prev =>
      prev.includes(id)
        ? prev.filter(krId => krId !== id)
        : [...prev, id]
    );
  };

  const addObjective = () => {
    const title = window.prompt('Enter new objective title:');
    if (title) {
      const newObjective: Objective = {
        id: uuidv4(),
        title,
        progress: 0,
        keyResults: [],
      };
      setObjectives(prev => [...prev, newObjective]);
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50 shadow-lg p-4 relative pb-20"> {/* Added relative and pb-20 for FAB */}
      {objectives.map((objective) => (
        <div key={objective.id}>
          {/* Objective Card */}
          <div 
            className="bg-white rounded-xl p-4 shadow-sm mb-4 cursor-pointer transition-all hover:shadow-md"
            onClick={() => setIsObjectiveExpanded(!isObjectiveExpanded)}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold">{objective.title}</h2>
              {isObjectiveExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${objective.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{objective.progress}% Complete</p>
          </div>

          {/* Key Results List */}
          {isObjectiveExpanded && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              {objective.keyResults.map((kr) => {
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
      ))}

      {/* Floating Action Button */}
      <button
        onClick={addObjective}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
        aria-label="Add Objective"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

export default App
