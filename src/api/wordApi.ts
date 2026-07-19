import axios from 'axios';
import { Word, LearningRecord, DailyStats } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5174/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCached = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = () => {
  cache.clear();
};

export const api = {
  clearCache,
  getWords: async (): Promise<Word[]> => {
    const cached = getCached<Word[]>('words');
    if (cached) return cached;
    try {
      const response = await client.get('/words');
      setCached('words', response.data);
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
    const cached = getCached<LearningRecord[]>('learningRecords');
    if (cached) return cached;
    try {
      const response = await client.get('/learning-records');
      setCached('learningRecords', response.data);
      return response.data;
    } catch {
      return [];
    }
  },

  markWord: async (wordId: string, status: 'learning' | 'mastered'): Promise<void> => {
    try {
      await client.post('/learning-records', { wordId, status });
      cache.delete('learningRecords');
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

  getReviewWords: async (): Promise<Word[]> => {
    try {
      const response = await client.get('/review-words');
      return response.data;
    } catch {
      return [];
    }
  },

  getAchievements: async (): Promise<{
    streak: number;
    totalMastered: number;
    totalReviews: number;
    learningDays: number;
    achievements: {
      id: string;
      name: string;
      description: string;
      icon: string;
      progress: number;
    }[];
  }> => {
    try {
      const response = await client.get('/achievements');
      return response.data;
    } catch {
      return { streak: 0, totalMastered: 0, totalReviews: 0, learningDays: 0, achievements: [] };
    }
  },

  getWordbooks: async (): Promise<{ id: string; name: string; description: string; createdAt: string }[]> => {
    try {
      const response = await client.get('/wordbooks');
      return response.data;
    } catch {
      return [];
    }
  },

  createWordbook: async (name: string, description: string): Promise<{ id: string; name: string; description: string } | null> => {
    try {
      const response = await client.post('/wordbooks', { name, description });
      return response.data;
    } catch {
      return null;
    }
  },

  getWordbookWords: async (wordbookId: string): Promise<Word[]> => {
    try {
      const response = await client.get(`/wordbooks/${wordbookId}/words`);
      return response.data;
    } catch {
      return [];
    }
  },

  addWordToWordbook: async (wordbookId: string, wordId: string): Promise<void> => {
    try {
      await client.post(`/wordbooks/${wordbookId}/words`, { wordId });
    } catch {
      throw new Error('Failed to add word');
    }
  },

  removeWordFromWordbook: async (wordbookId: string, wordId: string): Promise<void> => {
    try {
      await client.delete(`/wordbooks/${wordbookId}/words/${wordId}`);
    } catch {
      throw new Error('Failed to remove word');
    }
  },

  deleteWordbook: async (wordbookId: string): Promise<void> => {
    try {
      await client.delete(`/wordbooks/${wordbookId}`);
    } catch {
      throw new Error('Failed to delete wordbook');
    }
  },

  login: async (username: string, password: string): Promise<{ token: string; user: { id: string; username: string } }> => {
    const response = await client.post('/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string): Promise<{ token: string; user: { id: string; username: string } }> => {
    const response = await client.post('/register', { username, password });
    return response.data;
  },

  getFavorites: async (): Promise<Word[]> => {
    try {
      const response = await client.get('/favorites');
      const data = response.data as any[];
      return data.map((item) => {
        if (item.created_at) {
          item.createdAt = item.created_at;
        }
        return item;
      });
    } catch {
      return [];
    }
  },

  addFavorite: async (wordId: string): Promise<Word | null> => {
    try {
      const response = await client.post('/favorites', { word_id: wordId });
      const data = response.data;
      if (data && data.created_at) {
        data.createdAt = data.created_at;
      }
      return data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      if (axiosError.response?.data?.error === '已收藏') {
        return null;
      }
      return null;
    }
  },

  deleteFavorite: async (wordId: string): Promise<void> => {
    try {
      await client.delete(`/favorites/${wordId}`);
    } catch {
      throw new Error('Failed to remove favorite');
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await client.post('/change-password', { oldPassword, newPassword });
    return response.data;
  },

  clearData: async (): Promise<{ message: string }> => {
    const response = await client.post('/clear-data');
    return response.data;
  },
};
