export type TextType = 'PROSE' | 'POETRY' | 'NOVEL';

export interface Question {
  id: string;
  question: string;
  type: string; // e.g., "Language Analysis", "Theme", "Structure"
  standardAnswer: string;
  analysis: string; // Explaining why this is the answer based on the PDF rules
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
}

export interface User {
  username: string;
  avatar: string;
  role: 'student' | 'teacher';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
