export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface LearningRecord {
  id: string;
  wordId: string;
  word: string;
  status: 'new' | 'learning' | 'mastered';
  reviewCount: number;
  lastReviewAt: string | null;
  nextReviewAt: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  wordsLearned: number;
  wordsReviewed: number;
  accuracy: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  wordCount: number;
}
