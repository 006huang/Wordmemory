import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useWordStore } from './wordStore';

describe('wordStore', () => {
  beforeEach(() => {
    const store = useWordStore.getState();
    store.resetStore();
  });

  afterEach(() => {
    const store = useWordStore.getState();
    store.resetStore();
  });

  it('should initialize with empty words', () => {
    const store = useWordStore.getState();
    expect(store.words).toEqual([]);
  });

  it('should reset store state', () => {
    const store = useWordStore.getState();
    store.startLearning();
    store.resetStore();
    expect(store.isLearning).toBe(false);
    expect(store.currentWordIndex).toBe(0);
    expect(store.words).toEqual([]);
  });

  it('should clear learning data', () => {
    const store = useWordStore.getState();
    store.clearLearningData();
    expect(store.learningRecords).toEqual([]);
    expect(store.dailyStats).toEqual([]);
    expect(store.weeklyStats).toEqual([]);
    expect(store.reviewWords).toEqual([]);
  });

  it('should toggle learning state', () => {
    expect(useWordStore.getState().isLearning).toBe(false);
    useWordStore.getState().startLearning();
    expect(useWordStore.getState().isLearning).toBe(true);
    useWordStore.getState().stopLearning();
    expect(useWordStore.getState().isLearning).toBe(false);
  });

  it('should navigate between words', () => {
    const store = useWordStore.getState();
    expect(store.currentWordIndex).toBe(0);
    store.nextWord();
    expect(store.currentWordIndex).toBe(0);
    store.prevWord();
    expect(store.currentWordIndex).toBe(0);
  });
});