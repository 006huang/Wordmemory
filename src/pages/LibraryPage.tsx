import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Volume2, X } from 'lucide-react';
import { useWordStore } from '../store/wordStore';
import { Word } from '../types';
import { categories } from '../data/mockWords';

const speakWord = (word: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export const LibraryPage = () => {
  const { words, fetchWords, addWord, deleteWord } = useWordStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newWord, setNewWord] = useState<Omit<Word, 'id' | 'createdAt'>>({
    word: '',
    phonetic: '',
    meaning: '',
    example: '',
    category: 'CET-4',
    difficulty: 'medium',
  });

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const filteredWords = words.filter((word) => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || word.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddWord = async () => {
    if (newWord.word && newWord.meaning) {
      await addWord(newWord);
      setShowModal(false);
      setNewWord({
        word: '',
        phonetic: '',
        meaning: '',
        example: '',
        category: 'CET-4',
        difficulty: 'medium',
      });
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (confirm('确定要删除这个单词吗？')) {
      await deleteWord(wordId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">词库管理</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索单词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pr-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field md:w-32"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <button className="btn-primary flex items-center justify-center gap-2" onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5" />
            添加单词
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">单词</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">音标</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">释义</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">分类</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">难度</th>
                <th className="text-right py-3 px-4 text-gray-600 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((word) => (
                <tr key={word.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{word.word}</span>
                      <button className="p-1 hover:bg-gray-100 rounded" onClick={() => speakWord(word.word)}>
                        <Volume2 className="w-4 h-4 text-primary-500" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{word.phonetic}</td>
                  <td className="py-3 px-4 text-gray-700 max-w-xs truncate">{word.meaning}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                      {word.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      word.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {word.difficulty === 'easy' ? '简单' : word.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="p-2 hover:bg-red-100 rounded-lg text-red-500"
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>没有找到匹配的单词</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">添加新单词</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">单词</label>
                  <input
                    type="text"
                    className="input-field text-sm"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="单词"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">音标</label>
                  <input
                    type="text"
                    className="input-field text-sm"
                    value={newWord.phonetic}
                    onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
                    placeholder="音标"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">分类</label>
                  <select
                    className="input-field text-sm"
                    value={newWord.category}
                    onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">难度</label>
                  <select
                    className="input-field text-sm"
                    value={newWord.difficulty}
                    onChange={(e) => setNewWord({ ...newWord, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">释义</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                  placeholder="输入释义"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">例句</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  value={newWord.example}
                  onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                  placeholder="输入例句"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex-1 btn-secondary" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="flex-1 btn-primary" onClick={handleAddWord}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
