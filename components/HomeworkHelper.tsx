import React, { useState } from 'react';
import { solveHomework } from '../services/geminiService';
import { HomeworkHistoryItem } from '../types';
import { GraduationCap, ArrowRight, Image as ImageIcon, X, AlertCircle, History, ChevronRight, Calculator as CalculatorIcon, Delete } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface HomeworkHelperProps {
  history: HomeworkHistoryItem[];
  setHistory: (history: HomeworkHistoryItem[]) => void;
}

const HomeworkHelper: React.FC<HomeworkHelperProps> = ({ history, setHistory }) => {
  const [problem, setProblem] = useState('');
  const [subject, setSubject] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('All');
  
  // Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcEquation, setCalcEquation] = useState('');

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if ((!problem.trim() && !selectedImage) || !subject) return;
    
    setLoading(true);
    setSolution('');
    
    const result = await solveHomework(problem, selectedImage || undefined);
    
    // Save to history
    const newItem: HomeworkHistoryItem = {
      id: Date.now().toString(),
      subject,
      question: problem || "Image Question",
      solution: result,
      date: new Date().toLocaleDateString()
    };
    
    setHistory([newItem, ...history]);
    setSolution(result);
    setLoading(false);
  };

  const handleCalcInput = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcEquation('');
    } else if (val === '=') {
      try {
        // Safe evaluation
        // eslint-disable-next-line no-eval
        const result = eval(calcEquation + calcDisplay); 
        setCalcDisplay(String(result));
        setCalcEquation('');
      } catch (e) {
        setCalcDisplay('Error');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setCalcEquation(calcDisplay + ' ' + val + ' ');
      setCalcDisplay('0');
    } else {
      setCalcDisplay(calcDisplay === '0' ? val : calcDisplay + val);
    }
  };

  const filteredHistory = filterSubject === 'All' 
    ? history 
    : history.filter(h => h.subject === filterSubject);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Input Side (Left) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <h2 className="text-xl font-bold text-blue-900">Homework Helper</h2>
            </div>
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className={`p-2 rounded-lg transition-colors ${showCalculator ? 'bg-indigo-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              title="Toggle Calculator"
            >
              <CalculatorIcon size={20} />
            </button>
          </div>

          {/* Calculator Overlay */}
          {showCalculator && (
             <div className="mb-4 bg-blue-900 p-4 rounded-xl text-white shadow-lg">
                <div className="text-right mb-2 font-mono text-blue-200 text-xs h-4">{calcEquation}</div>
                <div className="text-right mb-4 font-mono text-3xl font-bold">{calcDisplay}</div>
                <div className="grid grid-cols-4 gap-2">
                   {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
                     <button 
                       key={btn} 
                       onClick={() => handleCalcInput(btn)}
                       className={`p-2 rounded-lg font-bold text-lg hover:bg-opacity-80 transition-colors
                         ${['/','*','-','+','='].includes(btn) ? 'bg-indigo-500' : btn === 'C' ? 'bg-red-500' : 'bg-blue-800'}`}
                     >
                       {btn}
                     </button>
                   ))}
                </div>
             </div>
          )}
          
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Select Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose Subject --</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <textarea
              className="flex-1 w-full p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 resize-none focus:ring-2 focus:ring-indigo-500 outline-none placeholder-blue-400 leading-relaxed"
              placeholder="Type your question here..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />

            {selectedImage && (
               <div className="relative w-fit">
                 <img src={selectedImage} alt="Problem context" className="h-24 rounded-lg border border-blue-200" />
                 <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                 >
                   <X size={12} />
                 </button>
               </div>
            )}

            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                <ImageIcon size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              <button
                onClick={handleSolve}
                disabled={loading || (!problem && !selectedImage) || !subject}
                className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all
                  ${loading || !subject 
                    ? 'bg-blue-300 text-white cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}
              >
                {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : <>Solve <ArrowRight size={18} /></>}
              </button>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2 text-amber-800 text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <p>Verify solutions. AI can occasionally be incorrect.</p>
            </div>
          </div>
        </div>

        {/* History List (Bottom Left) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 h-64 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-blue-900 flex items-center gap-2"><History size={16}/> Saved Solutions</h3>
             <select 
               className="text-xs border-blue-200 rounded-lg p-1 bg-blue-50 text-blue-900"
               value={filterSubject}
               onChange={(e) => setFilterSubject(e.target.value)}
             >
               <option value="All">All Subjects</option>
               {subjects.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
          <div className="overflow-y-auto space-y-2 pr-2">
            {filteredHistory.length === 0 ? (
              <p className="text-blue-400 text-sm text-center py-4">No saved solutions found.</p>
            ) : (
              filteredHistory.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSolution(item.solution)}
                  className="p-3 rounded-xl border border-blue-50 hover:bg-blue-50 cursor-pointer group transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1 inline-block group-hover:bg-white">{item.subject}</span>
                    <span className="text-xs text-blue-400">{item.date}</span>
                  </div>
                  <p className="text-sm text-blue-700 line-clamp-1 font-medium">{item.question}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Solution Side (Right) */}
      <div className="lg:col-span-7 bg-blue-50 rounded-2xl border border-blue-200 p-8 overflow-y-auto">
        {!solution && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-blue-400">
            <GraduationCap size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Ready to learn?</p>
            <p className="text-sm">Select a subject and enter your question.</p>
          </div>
        ) : (
          <div className="prose prose-blue max-w-none text-blue-900">
             {loading ? (
               <div className="flex flex-col items-center justify-center h-full text-indigo-600">
                  <div className="animate-bounce mb-2 text-3xl">🤔</div>
                  <p className="font-medium text-lg">Analyzing {subject} problem...</p>
               </div>
             ) : (
               <>
                 <div className="flex items-center gap-2 mb-6 pb-4 border-b border-blue-200">
                   <div className="bg-green-100 text-green-700 p-2 rounded-lg"><ChevronRight size={24}/></div>
                   <h3 className="text-xl font-bold text-blue-900">Solution</h3>
                 </div>
                 <ReactMarkdown>{solution}</ReactMarkdown>
               </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkHelper;