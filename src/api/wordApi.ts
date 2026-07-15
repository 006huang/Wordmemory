import axios from 'axios';
import { Word, LearningRecord, DailyStats } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getWords: async (): Promise<Word[]> => {
    try {
      const response = await client.get('/words');
      return response.data;
    } catch {
      return [];
    }
  },

  getWordById: async (id: string): Promise<Word | null> => {
    try {
      const response = await client.get(`/words/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  addWord: async (word: Omit<Word, 'id' | 'createdAt'>): Promise<Word | null> => {
    try {
      const response = await client.post('/words', word);
      return response.data;
    } catch {
      return null;
    }
  },

  updateWord: async (id: string, word: Partial<Word>): Promise<Word | null> => {
    try {
      const response = await client.put(`/words/${id}`, word);
      return response.data;
    } catch {
      return null;
    }
  },

  deleteWord: async (id: string): Promise<void> => {
    try {
      await client.delete(`/words/${id}`);
    } catch {
      throw new Error('Failed to delete word');
    }
  },

  getLearningRecords: async (): Promise<LearningRecord[]> => {
    try {
      const response = await client.get('/learning-records');
      return response.data;
    } catch {
      return [];
    }
  },

  markWord: async (wordId: string, status: 'learning' | 'mastered'): Promise<void> => {
    try {
      await client.post('/learning-records', { wordId, status });
    } catch {
      throw new Error('Failed to mark word');
    }
  },

  getDailyStats: async (): Promise<DailyStats[]> => {
    try {
      const response = await client.get('/stats/daily');
      return response.data;
    } catch {
      return [];
    }
  },

  getWeeklyStats: async (): Promise<DailyStats[]> => {
    try {
      const response = await client.get('/stats/weekly');
      return response.data;
    } catch {
      return [];
    }
  },
};
