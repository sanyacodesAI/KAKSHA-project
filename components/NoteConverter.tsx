import React, { useState } from 'react';
import { ConverterMode, Flashcard, QuizQuestion } from '../types';
import { generateSummary, generateQuiz, generateFlashcards } from '../services/geminiService';
import { FileText, HelpCircle, Layers, ArrowRight, Book, RotateCw, Check, X, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const NoteConverter: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [subject, setSubject] = useState('');
  const [mode, setMode] = useState<ConverterMode>(ConverterMode.SUMMARY);
  const [loading, setLoading] = useState(false);
  
  // Results
  const [summary, setSummary] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Flashcard State
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({});

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'English', 'Computer Science', 'General Knowledge'];

  const handleConvert = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSummary('');
    setQuiz([]);
    setFlashcards([]);
    setShowQuizResults(false);
    setQuizAnswers({});

    if (mode === ConverterMode.SUMMARY) {
      const res = await generateSummary(inputText);
      setSummary(res);
    } else if (mode === ConverterMode.QUIZ) {
      const res = await generateQuiz(inputText, subject);
      setQuiz(res);
    } else if (mode === ConverterMode.FLASHCARDS) {
      const res = await generateFlashcards(inputText);
      setFlashcards(res);
    }
    setLoading(false);
  };

  const handleQuizSelect = (questionId: string, optionIndex: number) => {
    if (showQuizResults) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleCard = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      
      {/* Input Side */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-2 rounded-xl border border-blue-200 flex gap-2">
          {[
            { id: ConverterMode.SUMMARY, label: 'Summary', icon: FileText },
            { id: ConverterMode.QUIZ, label: 'Quiz', icon: HelpCircle },
            { id: ConverterMode.FLASHCARDS, label: 'Flashcards', icon: Layers },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as ConverterMode)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all
                ${mode === m.id ? 'bg-indigo-600 text-white shadow-md' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              <m.icon size={18} />
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-4 relative">
          {mode === ConverterMode.QUIZ && (
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white border border-blue-200 text-blue-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                <option value="">-- Select Subject Context (Optional) --</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <GraduationCap className="absolute left-3 top-3.5 text-blue-400" size={18}/>
            </div>
          )}

          <textarea
            className="flex-1 w-full p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none leading-relaxed"
            placeholder="Paste your lecture notes, textbook text, or essay here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleConvert}
            disabled={loading || !inputText}
            className={`absolute bottom-6 right-6 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1
              ${loading ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-900 text-white hover:bg-blue-950'}`}
          >
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : <>Convert <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      {/* Output Side */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 overflow-y-auto relative">
        {!summary && quiz.length === 0 && flashcards.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-blue-400">
            <Book size={48} className="mb-4 opacity-50" />
            <p>Generated content will appear here.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-indigo-600">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
            <p className="font-medium animate-pulse">Analyzing text with Gemini...</p>
          </div>
        )}

        {/* Summary View */}
        {mode === ConverterMode.SUMMARY && summary && (
          <div className="prose prose-blue max-w-none text-blue-900">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <FileText className="text-indigo-600" /> Key Takeaways
            </h3>
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}

        {/* Quiz View */}
        {mode === ConverterMode.QUIZ && quiz.length > 0 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-blue-900">Knowledge Check {subject ? `(${subject})` : ''}</h3>
              {!showQuizResults && Object.keys(quizAnswers).length === quiz.length && (
                <button 
                  onClick={() => setShowQuizResults(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700"
                >
                  Check Answers
                </button>
              )}
            </div>
            
            {quiz.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                <p className="font-semibold text-lg text-blue-900 mb-4">{idx + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[q.id] === optIdx;
                    const isCorrect = q.correctAnswerIndex === optIdx;
                    
                    let styleClass = "border-blue-100 hover:bg-blue-50 text-blue-700";
                    if (showQuizResults) {
                      if (isCorrect) styleClass = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500";
                      else if (isSelected && !isCorrect) styleClass = "border-red-500 bg-red-50 text-red-800 ring-1 ring-red-500";
                      else styleClass = "border-blue-100 opacity-50";
                    } else if (isSelected) {
                      styleClass = "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500";
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleQuizSelect(q.id, optIdx)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${styleClass}`}
                        disabled={showQuizResults}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {showQuizResults && isCorrect && <Check size={18} />}
                          {showQuizResults && isSelected && !isCorrect && <X size={18} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flashcards View */}
        {mode === ConverterMode.FLASHCARDS && flashcards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {flashcards.map((card) => (
               <div 
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  className="group h-48 perspective-1000 cursor-pointer"
               >
                 <div className={`relative w-full h-full transition-all duration-500 preserve-3d shadow-sm hover:shadow-md rounded-xl
                    ${flippedCards[card.id] ? '[transform:rotateY(180deg)]' : ''}`}
                 >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white border border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Term</span>
                      <p className="font-bold text-blue-900 text-lg">{card.front}</p>
                      <RotateCw className="absolute bottom-4 right-4 text-blue-300 w-5 h-5" />
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)] bg-indigo-600 text-white rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Definition</span>
                      <p className="font-medium text-lg">{card.back}</p>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteConverter;