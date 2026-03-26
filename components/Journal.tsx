
import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry } from '../types';
import { generateJournalImage } from '../services/geminiService';
import { PenTool, Smile, Meh, Frown, BatteryCharging, Zap, Image as ImageIcon, Loader, TrendingUp, Clock, Activity, Check, ChevronDown, X } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  setEntries: (entries: JournalEntry[]) => void;
}

const Journal: React.FC<JournalProps> = ({ entries, setEntries }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('Neutral');
  
  // Multi-select state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [proficiency, setProficiency] = useState(50);
  const [efficiency, setEfficiency] = useState(75);
  const [studyHours, setStudyHours] = useState<number>(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const availableSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science', 'Other'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSave = async (withImage: boolean) => {
    if (!content.trim()) return;

    let imageUrl;
    if (withImage) {
      setIsGeneratingImage(true);
      imageUrl = await generateJournalImage(content);
      setIsGeneratingImage(false);
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      timestamp: Date.now(),
      mood,
      content,
      imageUrl: imageUrl || undefined,
      subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      proficiencyScore: selectedSubjects.length > 0 ? proficiency : undefined,
      studyHours: studyHours > 0 ? studyHours : undefined,
      efficiency: efficiency
    };

    setEntries([newEntry, ...entries]);
    setContent('');
    setMood('Neutral');
    setSelectedSubjects([]);
    setProficiency(50);
    setEfficiency(75);
    setStudyHours(0);
  };

  const moods: { label: JournalEntry['mood']; icon: any; color: string }[] = [
    { label: 'Happy', icon: Smile, color: 'text-emerald-500 hover:bg-emerald-50' },
    { label: 'Motivated', icon: Zap, color: 'text-yellow-500 hover:bg-yellow-50' },
    { label: 'Neutral', icon: Meh, color: 'text-blue-500 hover:bg-blue-50' },
    { label: 'Tired', icon: BatteryCharging, color: 'text-slate-500 hover:bg-slate-100' },
    { label: 'Stressed', icon: Frown, color: 'text-red-500 hover:bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Input Area */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex-1 flex flex-col relative overflow-y-auto">
          {isGeneratingImage && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <Loader className="animate-spin text-indigo-600 mb-2" size={32} />
                <p className="text-indigo-900 font-medium">Creating your journal art...</p>
              </div>
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <PenTool className="text-indigo-600" /> Daily Reflect
          </h2>
          
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {moods.map((m) => {
              const Icon = m.icon;
              const isSelected = mood === m.label;
              return (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all min-w-[80px] border
                    ${isSelected 
                      ? 'bg-blue-900 text-white border-blue-900' 
                      : `bg-white border-blue-200 ${m.color}`
                    }`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-sm font-bold text-blue-900">Study Subjects (Select Multiple)</label>
                <div 
                  className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer min-h-[48px] flex flex-wrap items-center gap-2"
                  onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                >
                  {selectedSubjects.length === 0 ? (
                    <span className="text-blue-400">Select subjects...</span>
                  ) : (
                    selectedSubjects.map(s => (
                      <span key={s} className="bg-white border border-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        {s}
                        <div 
                          className="cursor-pointer hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); toggleSubject(s); }}
                        >
                          <X size={12} />
                        </div>
                      </span>
                    ))
                  )}
                  <div className="ml-auto text-blue-400">
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isSubjectDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white border border-blue-100 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                    {availableSubjects.map((s) => (
                      <div 
                        key={s}
                        onClick={() => toggleSubject(s)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-blue-900"
                      >
                        <span className="font-medium">{s}</span>
                        {selectedSubjects.includes(s) && <Check size={18} className="text-indigo-600" />}
                      </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900">Study Duration (Hours)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0" 
                    max="24"
                    step="0.5"
                    value={studyHours}
                    onChange={(e) => setStudyHours(parseFloat(e.target.value))}
                    className="w-full p-3 pl-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <Clock size={18} className="absolute left-3 top-3.5 text-blue-400" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {selectedSubjects.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-900 flex justify-between">
                    <span>Overall Proficiency</span>
                    <span className="text-indigo-600">{proficiency}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={proficiency} 
                  onChange={(e) => setProficiency(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-blue-900 flex justify-between">
                  <span>Session Efficiency</span>
                  <span className="text-emerald-600">{efficiency}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={efficiency} 
                onChange={(e) => setEfficiency(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <textarea
            className="flex-1 w-full p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-400 resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-lg min-h-[150px]"
            placeholder="How was your study session today? What did you achieve?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex justify-end mt-4 gap-3 flex-wrap">
            <button
              onClick={() => handleSave(true)}
              disabled={!content.trim() || isGeneratingImage}
              className="px-5 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold hover:bg-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <ImageIcon size={18} />
              Save + Generate Art
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={!content.trim() || isGeneratingImage}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Past Entries</h3>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-blue-400 text-center text-sm">Your journal is empty.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-indigo-500 uppercase">{entry.date}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                     entry.mood === 'Happy' ? 'bg-emerald-100 text-emerald-700' :
                     entry.mood === 'Stressed' ? 'bg-red-100 text-red-700' :
                     'bg-blue-100 text-blue-700'
                  }`}>
                    {entry.mood}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {entry.subjects && entry.subjects.map(subj => (
                     <span key={subj} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                       {subj} {entry.proficiencyScore && `(${entry.proficiencyScore}%)`}
                     </span>
                  ))}
                  {entry.efficiency !== undefined && (
                     <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                       <Activity size={10} /> {entry.efficiency}% Eff.
                     </span>
                  )}
                  {entry.studyHours !== undefined && (
                     <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                       <Clock size={10} /> {entry.studyHours}h
                     </span>
                  )}
                </div>

                <p className="text-blue-900 leading-relaxed text-sm mb-3">{entry.content}</p>
                {entry.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-blue-100">
                    <img src={entry.imageUrl} alt="Journal art" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
