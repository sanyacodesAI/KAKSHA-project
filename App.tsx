
import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import StudyPlanner from './components/StudyPlanner';
import TaskManager from './components/TaskManager';
import NoteConverter from './components/NoteConverter';
import Journal from './components/Journal';
import HomeworkHelper from './components/HomeworkHelper';
import MindRefreshment from './components/MindRefreshment';
import { Task, StudySession, JournalEntry, HomeworkHistoryItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Global State
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Read Chapter 4 of Biology', priority: 'High', completed: false },
    { id: '2', title: 'Submit History Assignment', priority: 'Medium', completed: true },
  ]);
  
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [homeworkHistory, setHomeworkHistory] = useState<HomeworkHistoryItem[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} studySessions={sessions} journalEntries={journalEntries} />;
      case 'planner':
        return <StudyPlanner sessions={sessions} setSessions={setSessions} />;
      case 'tasks':
        return <TaskManager tasks={tasks} setTasks={setTasks} />;
      case 'homework':
        return <HomeworkHelper history={homeworkHistory} setHistory={setHomeworkHistory} />;
      case 'refreshment':
        return <MindRefreshment />;
      case 'converter':
        return <NoteConverter />;
      case 'journal':
        return <Journal entries={journalEntries} setEntries={setJournalEntries} />;
      default:
        return <Dashboard tasks={tasks} studySessions={sessions} journalEntries={journalEntries} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
