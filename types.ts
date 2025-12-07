export type TextType = 'PROSE' | 'POETRY' | 'NOVEL';

export interface Question {
  id: string;
  question: string;
  type: string; // e.g., "Language Analysis", "Theme", "Structure"
  standardAnswer: string;
  analysis: string; // Explaining why this is the answer based on the PDF rules
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalysisResult {
  id: string;
  title: string;
  summary: string;
  textType: TextType;
  structure: string[]; // Outline of the text
  themes: string[]; // Key themes/emotions
  techniques: {
    name: string;
    example: string;
    effect: string;
  }[];
  generatedQuestions: Question[];
  timestamp: number;
  originalText: string;
  chatHistory?: ChatMessage[]; // Store chat history for this specific analysis
}

export interface User {
  username: string;
  password?: string; // Optional because we might not store it in state after login
  avatar: string;
  role: 'student' | 'teacher';
}
