import React, { useState } from 'react';
import { Task, Priority } from '../types';
import { prioritizeTasks } from '../services/geminiService';
import { Plus, BarChart2, Trash2, Check, ArrowUp, Minus, ArrowDown } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks }) => {
  const [newTaskInput, setNewTaskInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const task: Task = {
      id: `manual-${Date.now()}`,
      title: newTaskInput,
      priority: Priority.MEDIUM, // Default, will be updated by AI
      completed: false
    };

    setTasks([...tasks, task]);
    setNewTaskInput('');
  };

  const handlePrioritize = async () => {
    if (tasks.length === 0) return;
    setLoading(true);
    const taskTitles = tasks.filter(t => !t.completed).map(t => t.title);
    
    // We only reprioritize active tasks
    const prioritizedActiveTasks = await prioritizeTasks(taskTitles);
    
    // Merge back: keep completed tasks, replace active ones
    const completedTasks = tasks.filter(t => t.completed);
    setTasks([...completedTasks, ...prioritizedActiveTasks]);
    setLoading(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'text-red-600 bg-red-50 border-red-100';
      case Priority.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-100';
      case Priority.LOW: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };
  
  const getPriorityIcon = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return <ArrowUp size={14} />;
      case Priority.MEDIUM: return <Minus size={14} />;
      case Priority.LOW: return <ArrowDown size={14} />;
    }
  };

  // Sort tasks: Active first, then by priority (High -> Low), then Completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityWeight = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Task Prioritizer</h2>
        
        <form onSubmit={addTask} className="flex gap-4 mb-4">
          <input
            type="text"
            className="flex-1 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-colors"
            placeholder="Add a new task (e.g., 'Finish History Essay', 'Buy Lab Coat')"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
          >
            <Plus size={24} />
          </button>
        </form>

        <div className="flex justify-between items-center">
          <p className="text-blue-500 text-sm">{tasks.filter(t => !t.completed).length} active tasks</p>
          <button
            onClick={handlePrioritize}
            disabled={loading || tasks.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all
              ${loading 
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                : 'bg-blue-900 text-white hover:bg-blue-800 shadow-md shadow-blue-900/20'}`}
          >
            {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/> : <BarChart2 size={18} />}
            AI Prioritize
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {sortedTasks.map((task) => (
          <div 
            key={task.id}
            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200
              ${task.completed 
                ? 'bg-blue-50 border-blue-100 opacity-60' 
                : 'bg-white border-blue-100 hover:shadow-sm hover:border-indigo-100'}`}
          >
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
                  ${task.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-blue-300 text-transparent hover:border-indigo-400'}`}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              
              <span className={`text-lg ${task.completed ? 'line-through text-blue-300' : 'text-blue-900'}`}>
                {task.title}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {!task.completed && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                  {getPriorityIcon(task.priority)}
                  {task.priority}
                </div>
              )}
              
              <button 
                onClick={() => deleteTask(task.id)}
                className="text-blue-300 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-12 text-blue-400">
            <p>No tasks yet. Add some to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;