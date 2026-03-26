
export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  date: string;
  notes?: string;
  completed: boolean;
  alarmSet?: boolean; // New: Alarm status
  alarmTime?: string; // New: Specific time for alarm
}

export interface JournalEntry {
  id: string;
  date: string;
  timestamp?: number; // New: For accurate charting
  mood: 'Happy' | 'Neutral' | 'Stressed' | 'Tired' | 'Motivated';
  content: string;
  imageUrl?: string;
  subjects?: string[];     // Changed: Support multiple subjects
  proficiencyScore?: number; // Self-assessed proficiency percentage
  studyHours?: number;     // Duration of study in hours
  efficiency?: number;     // Self-assessed efficiency/productivity percentage
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export enum ConverterMode {
  SUMMARY = 'SUMMARY',
  QUIZ = 'QUIZ',
  FLASHCARDS = 'FLASHCARDS'
}

export interface StudyPlanParams {
  subject: string;
  examDate: string;
  hoursPerDay: number;
}

export interface HomeworkHistoryItem {
  id: string;
  subject: string;
  question: string;
  solution: string;
  date: string;
}
