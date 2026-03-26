import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, BookOpen, FileText, GraduationCap, Gamepad2 } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Exam Prep', icon: Calendar }, // Renamed for Exam Prep
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'homework', label: 'Homework', icon: GraduationCap },
    { id: 'refreshment', label: 'Mind Refresh', icon: Gamepad2 }, // New Game Tab
    { id: 'converter', label: 'Smart Notes', icon: FileText },
    { id: 'journal', label: 'Journal', icon: BookOpen },
  ];

  return (
    <div className="w-20 lg:w-64 bg-blue-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 shadow-xl border-r border-blue-800">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-blue-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/50">K</div>
        <span className="text-xl font-bold hidden lg:block tracking-tight">KAKSHA</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3">
          <img src="https://picsum.photos/100/100" alt="Profile" className="w-10 h-10 rounded-full border-2 border-indigo-400" />
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white">Student User</p>
            <p className="text-xs text-blue-300">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;