import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task, Priority, StudySession, Flashcard, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Study Plan Generation ---

export const generateStudyPlan = async (subject: string, examDate: string, hoursPerDay: number): Promise<StudySession[]> => {
  const model = "gemini-2.5-flash";
  
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        durationMinutes: { type: Type.INTEGER },
        date: { type: Type.STRING, description: "YYYY-MM-DD format" },
        notes: { type: Type.STRING, description: "Brief focus or goal for the session" }
      },
      required: ["topic", "durationMinutes", "date"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Create a study plan for ${subject}. The exam is on ${examDate}. I can study ${hoursPerDay} hours per day. Start from tomorrow. Break it down into sessions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert study planner. Create realistic schedules."
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `session-${Date.now()}-${index}`,
      subject,
      completed: false,
      ...item
    }));
  } catch (error) {
    console.error("Error generating study plan:", error);
    return [];
  }
};

// --- Task Prioritization ---

export const prioritizeTasks = async (tasks: string[]): Promise<Task[]> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        reasoning: { type: Type.STRING } // Internal reasoning
      },
      required: ["title", "priority"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Prioritize these tasks for a student: ${JSON.stringify(tasks)}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a productivity expert. Prioritize tasks based on urgency and impact for a student."
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `task-${Date.now()}-${index}`,
      completed: false,
      title: item.title,
      priority: item.priority as Priority,
    }));
  } catch (error) {
    console.error("Error prioritizing tasks:", error);
    return tasks.map((t, i) => ({
      id: `task-${Date.now()}-${i}`,
      title: t,
      priority: Priority.MEDIUM,
      completed: false
    }));
  }
};

// --- Note Converter: Summary ---

export const generateSummary = async (text: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Summarize the following study notes into concise bullet points and key takeaways:\n\n${text}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
};

// --- Note Converter: Quiz ---

export const generateQuiz = async (text: string, subject?: string): Promise<QuizQuestion[]> => {
  const model = "gemini-2.5-flash";
  
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.INTEGER }
      },
      required: ["question", "options", "correctAnswerIndex"]
    }
  };

  const prompt = subject 
    ? `Create a quiz with 5 multiple choice questions based on the subject "${subject}" and this text: ${text}`
    : `Create a quiz with 5 multiple choice questions based on this text: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `quiz-${Date.now()}-${index}`,
      ...item
    }));
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

// --- Note Converter: Flashcards ---

export const generateFlashcards = async (text: string): Promise<Flashcard[]> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING },
        back: { type: Type.STRING }
      },
      required: ["front", "back"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Create 5-10 flashcards (concept on front, definition/details on back) from this text: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any, index: number) => ({
      id: `card-${Date.now()}-${index}`,
      ...item
    }));
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
};

// --- Motivation ---

export const getMotivationalMessage = async (): Promise<string> => {
  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Give me a short, powerful, single-sentence motivational quote for a student who is studying hard.",
    });
    return response.text?.trim() || "Believe you can and you're halfway there.";
  } catch (error) {
    return "Keep going, you're doing great!";
  }
};

// --- Journal Image Generation ---

export const generateJournalImage = async (entry: string): Promise<string | null> => {
  // Using gemini-2.5-flash-image for image generation as per instructions for this model class
  const model = "gemini-2.5-flash-image";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: `Generate a creative, artistic, abstract illustration that represents this journal entry mood and content: ${entry}` }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating journal image:", error);
    return null;
  }
};

// --- Homework Helper ---

export const solveHomework = async (problem: string, imageBase64?: string): Promise<string> => {
  // Using gemini-3-pro-preview for complex reasoning tasks (STEM/Math)
  const model = "gemini-3-pro-preview";
  
  const parts: any[] = [];
  if (imageBase64) {
    // Remove data URL prefix if present for API
    const base64Data = imageBase64.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG or JPEG, API is flexible usually but explicit mime helps
        data: base64Data
      }
    });
  }
  
  parts.push({
    text: `You are a helpful tutor. Solve the following homework problem step-by-step. Explain the concepts clearly. Problem: ${problem}`
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
    });
    return response.text || "Could not solve the problem.";
  } catch (error) {
    console.error("Error solving homework:", error);
    return "Sorry, I encountered an error while trying to solve this.";
  }
};