import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, Volume2 } from 'lucide-react';
import { useWordStore } from '../store/wordStore';
import { Word } from '../types';

export const HomePage = () => {
  const { words, currentWordIndex, isLearning, startLearning, nextWord, prevWord, markWord, fetchWords } = useWordStore();
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    if (isLearning) {
      setSessionWords(words.slice(0, 10));
      setShowAnswer(false);
      setMasteredCount(0);
      setLearningCount(0);
    }
  }, [isLearning, words]);

  const currentWord = sessionWords[currentWordIndex];

  const handleStartLearning = () => {
    startLearning();
  };

  const handleNext = () => {
    if (currentWordIndex < sessionWords.length - 1) {
      nextWord();
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentWordIndex > 0) {
      prevWord();
      setShowAnswer(false);
    }
  };

  const handleMarkMastered = async () => {
    if (currentWord) {
      await markWord(currentWord.id, 'mastered');
      setMasteredCount((prev) => prev + 1);
      handleNext();
    }
  };

  const handleMarkLearning = async () => {
    if (currentWord) {
      await markWord(currentWord.id, 'learning');
      setLearningCount((prev) => prev + 1);
      handleNext();
    }
  };

  const handleReset = () => {
    setSessionWords([]);
    setMasteredCount(0);
    setLearningCount(0);
  };

  if (!isLearning) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI背单词</h1>
          <p className="text-gray-600">智能记忆算法，高效掌握英语词汇</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card text-center">
            <div className="text-4xl font-bold text-primary-500 mb-2">{words.length}</div>
            <div className="text-gray-600">总词数</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">0</div>
            <div className="text-gray-600">已掌握</div>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">0</div>
            <div className="text-gray-600">学习中</div>
          </div>
        </div>

        <div className="card text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-12 h-12 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">准备开始学习</h2>
            <p className="text-gray-600">本次学习将包含 {Math.min(10, words.length)} 个单词</p>
          </div>
          <button className="btn-primary text-lg px-12 py-4" onClick={handleStartLearning}>
            开始学习
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">学习完成！</h2>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className="text-3xl font-bold text-green-500">{masteredCount}</div>
              <div className="text-gray-600">已掌握</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-500">{learningCount}</div>
              <div className="text-gray-600">学习中</div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button className="btn-secondary" onClick={handleReset}>
              返回首页
            </button>
            <button className="btn-primary" onClick={handleStartLearning}>
              继续学习
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100" onClick={handlePrev} disabled={currentWordIndex === 0}>
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <span className="text-lg font-medium text-gray-700">
            {currentWordIndex + 1} / {sessionWords.length}
          </span>
          <button className="p-2 rounded-lg hover:bg-gray-100" onClick={handleNext} disabled={currentWordIndex === sessionWords.length - 1}>
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        <div className="flex gap-4">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            已掌握: {masteredCount}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            学习中: {learningCount}
          </span>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-500">{currentWord.phonetic}</span>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Volume2 className="w-5 h-5 text-primary-500" />
              </button>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentWord.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            currentWord.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {currentWord.difficulty === 'easy' ? '简单' : currentWord.difficulty === 'medium' ? '中等' : '困难'}
          </span>
        </div>

        <div className="mb-4">
          <button
            className="btn-secondary w-full"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? '隐藏答案' : '显示答案'}
          </button>
        </div>

        {showAnswer && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">释义</div>
              <div className="text-lg text-gray-800">{currentWord.meaning}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">例句</div>
              <div className="text-gray-800 italic">{currentWord.example}</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button className="flex-1 btn-danger flex items-center justify-center gap-2" onClick={handleMarkLearning}>
          <XCircle className="w-5 h-5" />
          还需复习
        </button>
        <button className="flex-1 btn-success flex items-center justify-center gap-2" onClick={handleMarkMastered}>
          <CheckCircle className="w-5 h-5" />
          已掌握
        </button>
      </div>
    </div>
  );
};
