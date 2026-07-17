import { create } from 'zustand';
import { Word, LearningRecord, DailyStats } from '../types';
import { mockWords } from '../data/mockWords';
import { api } from '../api/wordApi';

interface WordStore {
  words: Word[];
  learningRecords: LearningRecord[];
  dailyStats: DailyStats[];
  weeklyStats: DailyStats[];
  reviewWords: Word[];
  currentWordIndex: number;
  isLearning: boolean;
  loading: boolean;

  fetchWords: () => Promise<void>;
  fetchLearningRecords: () => Promise<void>;
  fetchDailyStats: () => Promise<void>;
  fetchWeeklyStats: () => Promise<void>;
  fetchReviewWords: () => Promise<void>;
  startLearning: () => void;
  stopLearning: () => void;
  nextWord: () => void;
  prevWord: () => void;
  markWord: (wordId: string, status: 'learning' | 'mastered') => Promise<void>;
  addWord: (word: Omit<Word, 'id' | 'createdAt'>) => Promise<void>;
  deleteWord: (wordId: string) => Promise<void>;
  resetStore: () => void;
  clearLearningData: () => void;
}

export const useWordStore = create<WordStore>((set, get) => ({
  words: [],
  learningRecords: [],
  dailyStats: [],
  weeklyStats: [],
  reviewWords: [],
  currentWordIndex: 0,
  isLearning: false,
  loading: false,

  fetchWords: async () => {
    set({ loading: true });
    try {
      const data = await api.getWords();
      set({ words: data || mockWords });
    } catch {
      set({ words: mockWords });
    } finally {
      set({ loading: false });
    }
  },

  fetchLearningRecords: async () => {
    set({ loading: true });
    try {
      const data = await api.getLearningRecords();
      set({ learningRecords: data || [] });
    } catch {
      set({ learningRecords: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchDailyStats: async () => {
    set({ loading: true });
    try {
      const data = await api.getDailyStats();
      set({ dailyStats: data || [] });
    } catch {
      set({ dailyStats: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchWeeklyStats: async () => {
    set({ loading: true });
    try {
      const data = await api.getWeeklyStats();
      set({ weeklyStats: data || [] });
    } catch {
      set({ weeklyStats: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchReviewWords: async () => {
    set({ loading: true });
    try {
      const data = await api.getReviewWords();
      set({ reviewWords: data || [] });
    } catch {
      set({ reviewWords: [] });
    } finally {
      set({ loading: false });
    }
  },

  startLearning: () => {
    set({ isLearning: true, currentWordIndex: 0 });
  },

  stopLearning: () => {
    set({ isLearning: false, currentWordIndex: 0 });
  },

  nextWord: () => {
    const { currentWordIndex, words } = get();
    if (currentWordIndex < words.length - 1) {
      set({ currentWordIndex: currentWordIndex + 1 });
    }
  },

  prevWord: () => {
    const { currentWordIndex } = get();
    if (currentWordIndex > 0) {
      set({ currentWordIndex: currentWordIndex - 1 });
    }
  },

  markWord: async (wordId: string, status: 'learning' | 'mastered') => {
    try {
      await api.markWord(wordId, status);
      await get().fetchLearningRecords();
    } catch (error) {
      console.error('Failed to mark word:', error);
    }
  },

  addWord: async (word: Omit<Word, 'id' | 'createdAt'>) => {
    try {
      const newWord = await api.addWord(word);
      if (newWord) {
        set((state) => ({ words: [...state.words, newWord] }));
      }
    } catch (error) {
      console.error('Failed to add word:', error);
    }
  },

  deleteWord: async (wordId: string) => {
    try {
      await api.deleteWord(wordId);
      set((state) => ({ words: state.words.filter((w) => w.id !== wordId) }));
    } catch (error) {
      console.error('Failed to delete word:', error);
    }
  },

  resetStore: () => {
    set({
      words: [],
      learningRecords: [],
      dailyStats: [],
      weeklyStats: [],
      reviewWords: [],
      currentWordIndex: 0,
      isLearning: false,
      loading: false,
    });
  },

  clearLearningData: () => {
    set({
      learningRecords: [],
      dailyStats: [],
      weeklyStats: [],
      reviewWords: [],
      currentWordIndex: 0,
      isLearning: false,
    });
  },
}));
