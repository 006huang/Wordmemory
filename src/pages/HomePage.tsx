import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, Volume2, PartyPopper, Sparkles } from 'lucide-react';
import { useWordStore } from '../store/wordStore';
import { Word } from '../types';

const Confetti = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-[-20px] rounded-full animate-fall"
          style={{
            left: `${c.left}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const speakWord = (word: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export const HomePage = () => {
  const { words, learningRecords, reviewWords, currentWordIndex, isLearning, startLearning, stopLearning, nextWord, prevWord, markWord, fetchWords, fetchLearningRecords, fetchReviewWords } = useWordStore();
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mastered' | 'learning' | 'unlearned' | 'review' | null>(null);
  const [mode, setMode] = useState<'learn' | 'review'>('learn');
  const [studyMode, setStudyMode] = useState<'normal' | 'spelling' | 'choice' | 'listening'>('normal');
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingResult, setSpellingResult] = useState<'correct' | 'wrong' | null>(null);
  const [choices, setChoices] = useState<{ word: string; meaning: string; isCorrect: boolean }[]>([]);

  useEffect(() => {
    fetchWords();
    fetchLearningRecords();
    fetchReviewWords();
  }, [fetchWords, fetchLearningRecords, fetchReviewWords]);

  useEffect(() => {
    if (isLearning) {
      let selectedWords: Word[] = [];
      
      if (mode === 'review' && reviewWords.length > 0) {
        selectedWords = [...reviewWords].sort(() => Math.random() - 0.5).slice(0, 10);
      } else {
        const masteredIds = new Set(learningRecords.filter((r) => r.status === 'mastered').map((r) => r.wordId));
        const availableWords = words.filter((w) => !masteredIds.has(w.id));
        
        const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
        selectedWords = shuffled.slice(0, 10).length > 0 
          ? shuffled.slice(0, 10) 
          : [...words].sort(() => Math.random() - 0.5).slice(0, 10);
      }
      
      setSessionWords(selectedWords);
      setShowAnswer(false);
      setSpellingInput('');
      setSpellingResult(null);
      
      if (studyMode === 'choice' && selectedWords.length > 0) {
        generateChoices(selectedWords[0]);
      }
    }
  }, [isLearning, words, learningRecords, reviewWords, mode, studyMode]);

  const generateChoices = (currentWord: Word) => {
    const otherWords = words.filter((w) => w.id !== currentWord.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
    
    const allChoices = [
      { word: currentWord.word, meaning: currentWord.meaning, isCorrect: true },
      ...shuffledOthers.map((w) => ({ word: w.word, meaning: w.meaning, isCorrect: false }))
    ];
    
    setChoices(allChoices.sort(() => Math.random() - 0.5));
  };

  const masteredWordIds = new Set(learningRecords.filter((r) => r.status === 'mastered').map((r) => r.wordId));
  const learningWordIds = new Set(learningRecords.filter((r) => r.status === 'learning').map((r) => r.wordId));
  const totalMastered = masteredWordIds.size;
  const totalLearning = learningWordIds.size;
  const totalNotLearned = words.length - totalMastered - totalLearning;

  const filteredWords = selectedCategory === 'all' ? words :
    selectedCategory === 'mastered' ? words.filter((w) => masteredWordIds.has(w.id)) :
    selectedCategory === 'learning' ? words.filter((w) => learningWordIds.has(w.id)) :
    selectedCategory === 'unlearned' ? words.filter((w) => !masteredWordIds.has(w.id) && !learningWordIds.has(w.id)) :
    selectedCategory === 'review' ? reviewWords :
    words;

  const currentWord = sessionWords[currentWordIndex];

  useEffect(() => {
    if (studyMode === 'choice' && currentWord) {
      generateChoices(currentWord);
    }
    setSpellingInput('');
    setSpellingResult(null);
  }, [currentWord, studyMode]);

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
      if (currentWordIndex >= sessionWords.length - 1) {
        setSessionWords([]);
      } else {
        handleNext();
      }
    }
  };

  const handleMarkLearning = async () => {
    if (currentWord) {
      await markWord(currentWord.id, 'learning');
      if (currentWordIndex >= sessionWords.length - 1) {
        setSessionWords([]);
      } else {
        handleNext();
      }
    }
  };

  const handleReset = () => {
    stopLearning();
    setSessionWords([]);
    fetchLearningRecords();
  };

  const handleSpellingSubmit = () => {
    if (spellingInput.toLowerCase() === currentWord.word.toLowerCase()) {
      setSpellingResult('correct');
      setTimeout(() => {
        handleMarkMastered();
      }, 1000);
    } else {
      setSpellingResult('wrong');
    }
  };

  const handleChoiceSelect = (choice: { word: string; meaning: string; isCorrect: boolean }) => {
    if (choice.isCorrect) {
      handleMarkMastered();
    } else {
      handleMarkLearning();
    }
  };

  const handleListeningChoice = (word: string) => {
    if (word.toLowerCase() === currentWord.word.toLowerCase()) {
      handleMarkMastered();
    } else {
      handleMarkLearning();
    }
  };

  if (!isLearning) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI背单词</h1>
          <p className="text-gray-600">智能记忆算法，高效掌握英语词汇</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div 
            className="card text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory('all')}
          >
            <div className="text-4xl font-bold text-primary-500 mb-2">{words.length}</div>
            <div className="text-gray-600">总词数</div>
          </div>
          <div 
            className="card text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory('mastered')}
          >
            <div className="text-4xl font-bold text-green-500 mb-2">{totalMastered}</div>
            <div className="text-gray-600">已掌握</div>
          </div>
          <div 
            className="card text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory('learning')}
          >
            <div className="text-4xl font-bold text-yellow-500 mb-2">{totalLearning}</div>
            <div className="text-gray-600">学习中</div>
          </div>
          <div 
            className="card text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory('review')}
          >
            <div className={`text-4xl font-bold mb-2 ${reviewWords.length > 0 ? 'text-orange-500' : 'text-gray-400'}`}>{reviewWords.length}</div>
            <div className="text-gray-600">待复习</div>
          </div>
          <div 
            className="card text-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCategory('unlearned')}
          >
            <div className="text-4xl font-bold text-gray-500 mb-2">{totalNotLearned}</div>
            <div className="text-gray-600">未学习</div>
          </div>
        </div>

        {selectedCategory !== null && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedCategory === 'all' && '所有单词'}
                {selectedCategory === 'mastered' && '已掌握单词'}
                {selectedCategory === 'learning' && '学习中单词'}
                {selectedCategory === 'review' && '待复习单词'}
                {selectedCategory === 'unlearned' && '未学习单词'}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedCategory(null)}
              >
                关闭
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredWords.map((word) => (
                <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{word.word}</div>
                    <div className="text-sm text-gray-500">{word.meaning}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    word.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {word.difficulty === 'easy' ? '简单' : word.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-12 h-12 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">准备开始学习</h2>
            <p className="text-gray-600">本次学习将包含 {Math.min(10, words.length)} 个单词</p>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">选择学习模式</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studyMode === 'normal' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setStudyMode('normal')}
              >
                普通模式
              </button>
              <button 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studyMode === 'spelling' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setStudyMode('spelling')}
              >
                拼写测试
              </button>
              <button 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studyMode === 'choice' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setStudyMode('choice')}
              >
                选择题
              </button>
              <button 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studyMode === 'listening' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setStudyMode('listening')}
              >
                听音辨词
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-12 py-4" onClick={() => { setMode('learn'); handleStartLearning(); }}>
              开始学习
            </button>
            {reviewWords.length > 0 && (
              <button className="btn-secondary text-lg px-12 py-4" onClick={() => { setMode('review'); handleStartLearning(); }}>
                开始复习 ({reviewWords.length})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="max-w-4xl mx-auto">
        <Confetti />
        <div className="card text-center animate-bounce-in">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <PartyPopper className="w-12 h-12 text-green-500" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-500 absolute top-0 right-1/3 animate-spin" />
            <Sparkles className="w-6 h-6 text-green-500 absolute bottom-0 left-1/3 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 学习完成！</h2>
          <p className="text-gray-600 mb-6">太棒了！你完成了本轮学习</p>
          <div className="flex justify-center gap-8 mb-6">
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-green-500">{totalMastered}</div>
              <div className="text-gray-600">累计已掌握</div>
            </div>
            <div className="transform hover:scale-110 transition-transform">
              <div className="text-4xl font-bold text-yellow-500">{totalLearning}</div>
              <div className="text-gray-600">累计学习中</div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button className="btn-secondary transform hover:scale-105 transition-transform" onClick={handleReset}>
              返回首页
            </button>
            <button className="btn-primary transform hover:scale-105 transition-transform" onClick={handleStartLearning}>
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
            已掌握: {totalMastered}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            学习中: {totalLearning}
          </span>
        </div>
      </div>

      {studyMode === 'normal' && (
        <div className="card mb-6">
          <div className="perspective-1000">
            <div 
              className={`relative w-full transition-transform duration-500 ${
                showAnswer ? 'rotate-y-180' : ''
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div 
                className="backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2 animate-fade-in">{currentWord.word}</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{currentWord.phonetic}</span>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => speakWord(currentWord.word)}>
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
                    className="btn-secondary w-full transform hover:scale-105 transition-transform"
                    onClick={() => setShowAnswer(!showAnswer)}
                  >
                    {showAnswer ? '隐藏答案' : '显示答案'}
                  </button>
                </div>
              </div>

              <div 
                className="backface-hidden absolute top-0 left-0 w-full"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
                    <div className="text-sm text-primary-600 mb-1 font-medium">释义</div>
                    <div className="text-lg text-gray-800">{currentWord.meaning}</div>
                  </div>
                  {currentWord.example && (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1 font-medium">例句</div>
                      <div className="text-gray-800 italic">{currentWord.example}</div>
                    </div>
                  )}
                </div>

                <div className="mb-4 mt-4">
                  <button
                    className="btn-secondary w-full transform hover:scale-105 transition-transform"
                    onClick={() => setShowAnswer(!showAnswer)}
                  >
                    {showAnswer ? '隐藏答案' : '显示答案'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {studyMode === 'spelling' && (
        <div className="card mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">根据释义写出单词</h2>
            <div className="text-2xl text-gray-800 font-medium">{currentWord.meaning}</div>
          </div>
          
          <div className="mb-4">
            <input
              type="text"
              value={spellingInput}
              onChange={(e) => { setSpellingInput(e.target.value); setSpellingResult(null); }}
              onKeyPress={(e) => e.key === 'Enter' && handleSpellingSubmit()}
              placeholder="输入单词..."
              className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none transition-colors ${
                spellingResult === 'correct' ? 'border-green-500 bg-green-50' :
                spellingResult === 'wrong' ? 'border-red-500 bg-red-50' :
                'border-gray-200 focus:border-primary-500'
              }`}
              autoFocus
            />
          </div>

          {spellingResult === 'wrong' && (
            <div className="text-center text-red-500 mb-4">
              正确答案: <span className="font-bold">{currentWord.word}</span>
            </div>
          )}

          <button
            className="btn-primary w-full"
            onClick={handleSpellingSubmit}
            disabled={!spellingInput.trim()}
          >
            提交答案
          </button>
        </div>
      )}

      {studyMode === 'choice' && (
        <div className="card mb-6">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</h2>
            <div className="text-gray-500">{currentWord.phonetic}</div>
            <button className="p-2 hover:bg-gray-100 rounded-lg inline-block mt-2" onClick={() => speakWord(currentWord.word)}>
              <Volume2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          <div className="space-y-3">
            {choices.map((choice, index) => (
              <button
                key={index}
                className="w-full p-4 text-left rounded-lg border-2 hover:border-primary-300 transition-colors"
                onClick={() => handleChoiceSelect(choice)}
              >
                <div className="text-lg text-gray-800">{choice.meaning}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {studyMode === 'listening' && (
        <div className="card mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">听音辨词</h2>
            <button
              className="btn-primary text-lg px-8 py-4"
              onClick={() => speakWord(currentWord.word)}
            >
              <Volume2 className="w-6 h-6 inline-block mr-2" />
              播放发音
            </button>
          </div>

          <div className="space-y-3">
            {choices.map((choice, index) => (
              <button
                key={index}
                className="w-full p-4 rounded-lg border-2 hover:border-primary-300 transition-colors"
                onClick={() => handleListeningChoice(choice.word)}
              >
                <div className="text-xl font-medium text-gray-800">{choice.word}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {studyMode === 'normal' && (
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
      )}
    </div>
  );
};
