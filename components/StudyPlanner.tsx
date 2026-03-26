import React, { useState, useEffect } from 'react';
import { generateStudyPlan } from '../services/geminiService';
import { StudySession } from '../types';
import { Sparkles, Calendar as CalendarIcon, Clock, BookOpen, Bell, BellOff, Music, Trash2, CheckCircle, RotateCcw } from 'lucide-react';

interface StudyPlannerProps {
  sessions: StudySession[];
  setSessions: (sessions: StudySession[]) => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ sessions, setSessions }) => {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [audio] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3')); // Gentle alarm sound
  
  // State for adding manual alarm times to generated sessions
  const [editingAlarm, setEditingAlarm] = useState<string | null>(null);
  const [tempAlarmTime, setTempAlarmTime] = useState('');

  // Alarm Check Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      sessions.forEach(session => {
        if (session.alarmSet && session.alarmTime === currentTime && !session.completed) {
          audio.play().catch(e => console.log("Audio play failed (interaction required):", e));
          // Simple browser alert for now, could be a toast
          if(confirm(`⏰ Time to study ${session.topic}! Click OK to stop alarm.`)) {
             audio.pause();
             audio.currentTime = 0;
          }
          // Toggle alarm off after ringing to prevent loop
          toggleAlarm(session.id, false);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [sessions, audio]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !examDate) return;
    
    setLoading(true);
    const newSessions = await generateStudyPlan(subject, examDate, hours);
    setSessions([...sessions, ...newSessions]);
    setLoading(false);
    setSubject('');
  };

  const toggleSession = (id: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const toggleAlarm = (id: string, active: boolean) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, alarmSet: active } : s));
  };

  const saveAlarmTime = (id: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, alarmTime: tempAlarmTime, alarmSet: true } : s));
    setEditingAlarm(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-blue-100 flex flex-col">
        <div className="flex items-center gap-3 mb-6 text-blue-900">
           <div className="p-3 bg-blue-100 rounded-xl">
             <CalendarIcon size={24} className="text-indigo-600"/>
           </div>
           <div>
             <h2 className="text-xl font-bold">Exam Prep</h2>
             <p className="text-xs text-blue-500 font-medium">AI Scheduler</p>
           </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Target Subject</label>
            <input
              type="text"
              className="w-full p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="e.g., Physics, Calculus"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Exam Date</label>
            <input
              type="date"
              className="w-full p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Daily Study Hours</label>
            <div className="flex items-center gap-4 bg-blue-50 p-2 rounded-xl border border-blue-200">
               <button type="button" onClick={() => setHours(Math.max(1, hours - 1))} className="w-10 h-10 bg-white rounded-lg text-indigo-600 font-bold shadow-sm hover:bg-blue-100">-</button>
               <span className="flex-1 text-center font-bold text-blue-900">{hours} Hours</span>
               <button type="button" onClick={() => setHours(Math.min(12, hours + 1))} className="w-10 h-10 bg-white rounded-lg text-indigo-600 font-bold shadow-sm hover:bg-blue-100">+</button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !subject || !examDate}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2
              ${loading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:-translate-y-1'}`}
          >
            {loading ? <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"/> : <><Sparkles /> Generate Plan</>}
          </button>
        </form>

        <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
           <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><Music size={16}/> Study Mode</h3>
           <p className="text-xs text-blue-600 mb-3">Enable alarm sounds for your scheduled slots.</p>
        </div>
      </div>

      {/* Schedule List */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-blue-100 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Your Study Plan</h2>
            <div className="text-sm font-medium text-blue-500">{sessions.filter(s => !s.completed).length} upcoming sessions</div>
         </div>

         <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {sessions.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-blue-300">
                  <BookOpen size={64} className="mb-4 opacity-50"/>
                  <p className="text-lg font-medium">No study plan generated yet.</p>
               </div>
            ) : (
               sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`group relative p-5 rounded-2xl border transition-all duration-300
                      ${session.completed 
                        ? 'bg-blue-50 border-blue-100 opacity-60' 
                        : 'bg-white border-blue-100 hover:shadow-md hover:border-indigo-200'}`}
                  >
                     <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                           <button 
                             onClick={() => toggleSession(session.id)}
                             className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                               ${session.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-blue-200 text-transparent hover:border-indigo-400'}`}
                           >
                              <CheckCircle size={14} fill="currentColor" />
                           </button>
                           
                           <div>
                              <h3 className={`font-bold text-lg mb-1 ${session.completed ? 'line-through text-blue-400' : 'text-blue-900'}`}>
                                 {session.topic}
                              </h3>
                              <div className="flex flex-wrap gap-4 text-sm text-blue-500">
                                 <span className="flex items-center gap-1"><BookOpen size={14}/> {session.subject}</span>
                                 <span className="flex items-center gap-1"><Clock size={14}/> {session.durationMinutes} min</span>
                                 <span className="flex items-center gap-1"><CalendarIcon size={14}/> {session.date}</span>
                              </div>
                              {session.notes && <p className="mt-2 text-sm text-blue-400 italic">{session.notes}</p>}
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                           <div className="flex items-center gap-2">
                              {editingAlarm === session.id ? (
                                 <div className="flex items-center gap-1 bg-blue-50 rounded-lg p-1 border border-blue-200">
                                    <input 
                                      type="time" 
                                      className="bg-transparent text-sm font-bold text-blue-900 outline-none"
                                      value={tempAlarmTime}
                                      onChange={(e) => setTempAlarmTime(e.target.value)}
                                    />
                                    <button onClick={() => saveAlarmTime(session.id)} className="text-indigo-600 hover:bg-indigo-100 p-1 rounded"><CheckCircle size={14}/></button>
                                 </div>
                              ) : (
                                 <button 
                                   onClick={() => {
                                      if(session.alarmSet) toggleAlarm(session.id, false);
                                      else {
                                         setEditingAlarm(session.id);
                                         setTempAlarmTime(session.alarmTime || "09:00");
                                      }
                                   }}
                                   className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                                      ${session.alarmSet 
                                         ? 'bg-indigo-100 text-indigo-700' 
                                         : 'bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600'}`}
                                 >
                                    {session.alarmSet ? <Bell size={12} fill="currentColor"/> : <BellOff size={12}/>}
                                    {session.alarmSet ? session.alarmTime : 'Set Alarm'}
                                 </button>
                              )}
                              
                              <button 
                                onClick={() => deleteSession(session.id)}
                                className="p-2 text-blue-300 hover:text-red-500 transition-colors"
                              >
                                 <Trash2 size={16}/>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};

export default StudyPlanner;