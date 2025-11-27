export interface VocabularyItem {
  english: string;
  russian: string;
  transcription: string;
  example: string;
  definition: string;
}

export enum AppView {
  GENERATE = 'GENERATE',
  LEARN = 'LEARN',
  QUIZ_SETUP = 'QUIZ_SETUP',
  QUIZ = 'QUIZ',
}

export enum DifficultyLevel {
  BEGINNER = 'Начинающий (A1-A2)',
  INTERMEDIATE = 'Средний (B1-B2)',
  ADVANCED = 'Продвинутый (C1-C2)',
}

export enum QuizMode {
  MULTIPLE_CHOICE = 'Тест (выбор ответа)',
  TEXT_INPUT = 'Ввод текста',
}

export enum QuizDirection {
  EN_RU = '🇬🇧 → 🇷🇺 (EN-RU)',
  RU_EN = '🇷🇺 → 🇬🇧 (RU-EN)',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}