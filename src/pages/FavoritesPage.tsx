import { useEffect, useState } from 'react';
import { Heart, Volume2, Trash2, BookOpen } from 'lucide-react';
import { Word } from '../types';
import { api } from '../api/wordApi';

const speakWord = (word: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Word[]>([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const data = await api.getFavorites();
    setFavorites(data);
  };

  const handleRemoveFavorite = async (wordId: string) => {
    if (!window.confirm('确定要取消收藏这个单词吗？')) {
      return;
    }
    await api.deleteFavorite(wordId);
    setFavorites((prev) => prev.filter((f) => f.id !== wordId));
    alert('已取消收藏');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">我的收藏</h1>
        <p className="text-gray-600">共收藏 {favorites.length} 个单词</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((word) => (
            <div
              key={word.id}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-bold text-gray-800">{word.word}</span>
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => speakWord(word.word)}
                    >
                      <Volume2 className="w-5 h-5 text-primary-500" />
                    </button>
                  </div>
                  <div className="text-gray-500 font-mono text-sm mb-2">{word.phonetic}</div>
                  <div className="text-gray-700 mb-3">{word.meaning}</div>
                  {word.example && (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded">
                      {word.example}
                    </div>
                  )}
                </div>
                <button
                  className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors ml-4"
                  onClick={() => handleRemoveFavorite(word.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                  {word.category}
                </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  word.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {word.difficulty === 'easy' ? '简单' : word.difficulty === 'medium' ? '中等' : '困难'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">还没有收藏任何单词</h3>
          <p className="text-gray-500 mb-4">在词库中点击爱心图标可以收藏单词</p>
          <button
            className="btn-primary"
            onClick={() => window.location.href = '/library'}
          >
            <BookOpen className="w-5 h-5 inline-block mr-2" />
            去词库看看
          </button>
        </div>
      )}
    </div>
  );
};