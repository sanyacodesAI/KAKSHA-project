
import React, { useState, useEffect } from 'react';
import { Task, StudySession, JournalEntry } from '../types';
import { getMotivationalMessage } from '../services/geminiService';
import { Clock, CheckCircle, AlertCircle, Play, Pause, RotateCcw, Calendar, Flame, Target, Book, ArrowRight, BookOpen, TrendingUp, Zap, BarChart2, PieChart as PieChartIcon, LayoutList, Hourglass, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, CartesianGrid, AreaChart, Area, YAxis } from 'recharts';

interface DashboardProps {
  tasks: Task[];
  studySessions: StudySession[];
  journalEntries: JournalEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, studySessions, journalEntries }) => {
  const [quote, setQuote] = useState('');
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 minutes default
  const [isFocusing, setIsFocusing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    const fetchQuote = async () => {
      const q = await getMotivationalMessage();
      setQuote(q);
    };
    fetchQuote();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isFocusing && !isPaused && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setIsFocusing(false);
      setIsPaused(false);
      // Optional: Play sound or notification
    }
    return () => clearInterval(interval);
  }, [isFocusing, isPaused, focusTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startDeepFocus = () => {
    setIsFocusing(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const stopFocus = () => {
    setIsFocusing(false);
    setIsPaused(false);
    setFocusTime(25 * 60);
  };

  // Daily Activity Data
  const weeklyActivityData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    // Find journal entry for this day
    const entry = journalEntries.find(e => new Date(e.timestamp || 0).getDate() === d.getDate());
    return {
       name: d.toLocaleDateString(undefined, { weekday: 'short' }),
       hours: entry?.studyHours || 0
    };
  });

  // Proficiency Data
  // Now handles multiple subjects per entry by joining them string or just using the entry data
  const proficiencyData = journalEntries
    .filter(e => e.subjects && e.subjects.length > 0 && e.proficiencyScore)
    .map(e => ({
      name: e.date,
      score: e.proficiencyScore,
      subject: e.subjects!.join(', ') // Join array to string for display
    }))
    .reverse()
    .slice(0, 7);

  // Efficiency Data
  const avgEfficiency = journalEntries.reduce((acc, curr) => acc + (curr.efficiency || 0), 0) / (journalEntries.length || 1);
  const efficiencyData = [
    { name: 'Efficient', value: avgEfficiency, color: '#10b981' }, // Emerald
    { name: 'Gap', value: Math.max(0, 100 - avgEfficiency), color: '#e2e8f0' } // Slate/Blue-gray
  ];

  // Calculated Stats
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = tasks.length - completedTasksCount;
  const totalStudyHours = journalEntries.reduce((acc, curr) => acc + (curr.studyHours || 0), 0);
  const totalSessions = journalEntries.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
       {/* Hero Section */}
       <div className="lg:col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-100 drop-shadow-sm mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                     KAKSHA
                   </h1>
                   <p className="text-blue-100 text-lg font-medium mb-6 flex items-center gap-2 opacity-90">
                      <span className="w-10 h-1 bg-blue-300 rounded-full"></span>
                      Your AI Study Companion
                   </p>
                   
                   <h2 className="text-2xl font-bold mb-1">Welcome Back, Scholar!</h2>
                   <p className="text-blue-100 opacity-90 max-w-lg italic text-sm">"{quote}"</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
                   <Flame className="text-yellow-300 w-10 h-10" />
                </div>
             </div>

             {/* Focus Timer UI */}
             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-full ${isFocusing && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'} transition-colors duration-300 shadow-lg`}>
                      <Clock size={32} className="text-white"/>
                   </div>
                   <div>
                      <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Deep Focus</p>
                      <h2 className="text-4xl font-mono font-bold tracking-wider">{formatTime(focusTime)}</h2>
                      {isPaused && <span className="text-xs text-yellow-300 font-bold animate-pulse">PAUSED</span>}
                   </div>
                </div>
                
                <div className="flex gap-3">
                   {!isFocusing ? (
                      <button 
                        onClick={startDeepFocus}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-md"
                      >
                         <Zap size={20} fill="currentColor" /> Start Session
                      </button>
                   ) : (
                      <>
                        <button 
                          onClick={togglePause}
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-bold transition-colors"
                        >
                           {isPaused ? <Play size={24} fill="currentColor"/> : <Pause size={24} fill="currentColor"/>}
                        </button>
                        <button 
                          onClick={stopFocus}
                          className="bg-white/20 hover:bg-red-500/80 text-white px-4 py-3 rounded-xl font-bold transition-colors"
                        >
                           <RotateCcw size={24} />
                        </button>
                      </>
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Right Column: Profile & Stats */}
       <div className="flex flex-col gap-4">
          
          {/* Profile Card */}
          <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm flex items-center gap-4 relative">
             <button className="absolute top-4 right-4 text-blue-300 hover:text-indigo-600 transition-colors">
                <Settings size={18} />
             </button>
             <div className="relative">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Student" className="w-16 h-16 rounded-2xl border-2 border-indigo-100 object-cover shadow-sm" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
             </div>
             <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-lg leading-tight">Rahul Sharma</h3>
                <p className="text-xs text-blue-500 font-medium mb-1">Class 12 • Science</p>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                   <Flame size={12} fill="currentColor" /> 12 Day Streak
                </div>
             </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 flex-1">
             <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                   <CheckCircle size={20} />
                </div>
                <div>
                   <p className="text-xs text-blue-400 font-bold uppercase">Tasks Done</p>
                   <p className="text-xl font-bold text-blue-900">{completedTasksCount}/{tasks.length}</p>
                </div>
             </div>
             
             <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                   <Hourglass size={20} />
                </div>
                <div>
                   <p className="text-xs text-blue-400 font-bold uppercase">Pending</p>
                   <p className="text-xl font-bold text-blue-900">{pendingTasksCount}</p>
                </div>
             </div>

             <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                   <Clock size={20} />
                </div>
                <div>
                   <p className="text-xs text-blue-400 font-bold uppercase">Focus Hours</p>
                   <p className="text-xl font-bold text-blue-900">{totalStudyHours}h</p>
                </div>
             </div>

             <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                   <LayoutList size={20} />
                </div>
                <div>
                   <p className="text-xs text-blue-400 font-bold uppercase">Sessions</p>
                   <p className="text-xl font-bold text-blue-900">{totalSessions}</p>
                </div>
             </div>
          </div>
       </div>

       {/* Charts Section */}
       <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Daily Activity */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
             <h3 className="font-bold text-blue-900 mb-6 flex items-center gap-2">
                <BarChart2 className="text-indigo-500"/> Daily Activity (Hrs)
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={weeklyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={30} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Proficiency Trends */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
             <h3 className="font-bold text-blue-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-500"/> Subject Proficiency
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={proficiencyData}>
                      <defs>
                         <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                      <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Efficiency Pie */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
             <h3 className="font-bold text-blue-900 mb-6 flex items-center gap-2">
                <PieChartIcon className="text-purple-500" /> Avg Efficiency
             </h3>
             <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                         data={efficiencyData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                      >
                         {efficiencyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                         ))}
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                   <span className="text-3xl font-bold text-blue-900">{Math.round(avgEfficiency)}%</span>
                   <span className="text-xs text-blue-400 font-bold uppercase">Productive</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;
