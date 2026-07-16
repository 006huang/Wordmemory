import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Volume2, X, BookOpen, BookMarked, ChevronRight } from 'lucide-react';
import { useWordStore } from '../store/wordStore';
import { Word } from '../types';
import { categories } from '../data/mockWords';
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
  const [activeTab, setActiveTab] = useState<'words' | 'wordbooks'>('words');
  const [wordbooks, setWordbooks] = useState<{ id: string; name: string; description: string; createdAt: string }[]>([]);
  const [selectedWordbook, setSelectedWordbook] = useState<string | null>(null);
  const [wordbookWords, setWordbookWords] = useState<Word[]>([]);
  const [showWordbookModal, setShowWordbookModal] = useState(false);
  const [newWordbook, setNewWordbook] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchWords();
    fetchWordbooks();
  }, [fetchWords]);

  const fetchWordbooks = async () => {
    const data = await api.getWordbooks();
    setWordbooks(data);
  };

  const handleCreateWordbook = async () => {
    if (newWordbook.name) {
      await api.createWordbook(newWordbook.name, newWordbook.description);
      setShowWordbookModal(false);
      setNewWordbook({ name: '', description: '' });
      fetchWordbooks();
    }
  };

  const handleSelectWordbook = async (wordbookId: string) => {
    setSelectedWordbook(wordbookId);
    const words = await api.getWordbookWords(wordbookId);
    setWordbookWords(words);
  };

  const handleAddWordToWordbook = async (wordId: string) => {
    if (selectedWordbook) {
      await api.addWordToWordbook(selectedWordbook, wordId);
      handleSelectWordbook(selectedWordbook);
    }
  };

  const handleRemoveWordFromWordbook = async (wordId: string) => {
    if (selectedWordbook) {
      await api.removeWordFromWordbook(selectedWordbook, wordId);
      handleSelectWordbook(selectedWordbook);
    }
  };

  const handleDeleteWordbook = async (wordbookId: string) => {
    if (confirm('确定要删除这个词书吗？')) {
      await api.deleteWordbook(wordbookId);
      setSelectedWordbook(null);
      setWordbookWords([]);
      fetchWordbooks();
    }
  };

  const isWordInWordbook = (wordId: string) => {
    return wordbookWords.some((w) => w.id === wordId);
  };

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
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'words' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('words')}
          >
            <BookOpen className="w-4 h-4 inline-block mr-2" />
            单词列表
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'wordbooks' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('wordbooks')}
          >
            <BookMarked className="w-4 h-4 inline-block mr-2" />
            我的词书
          </button>
        </div>

        {activeTab === 'words' && (
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
        )}

        {activeTab === 'wordbooks' && (
          <div className="flex justify-between">
            <p className="text-gray-600">管理你的自定义词书</p>
            <button className="btn-primary flex items-center justify-center gap-2" onClick={() => setShowWordbookModal(true)}>
              <Plus className="w-5 h-5" />
              创建词书
            </button>
          </div>
        )}
      </div>

      {activeTab === 'words' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium w-20">单词</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium w-32">音标</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium flex-1">释义</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium w-32">分类/难度</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium w-16">操作</th>
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
                    <td className="py-3 px-4 text-gray-500 font-mono">{word.phonetic}</td>
                    <td className="py-3 px-4 text-gray-700">{word.meaning}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
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
      )}

      {activeTab === 'wordbooks' && (
        <div className="card">
          {!selectedWordbook ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wordbooks.map((wordbook) => (
                <div 
                  key={wordbook.id} 
                  className="p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectWordbook(wordbook.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{wordbook.name}</h3>
                    <button 
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                      onClick={(e) => { e.stopPropagation(); handleDeleteWordbook(wordbook.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{wordbook.description}</p>
                  <div className="flex items-center text-sm text-primary-500">
                    查看单词 <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
              {wordbooks.length === 0 && (
                <div className="text-center py-12 text-gray-500 col-span-2">
                  <BookMarked className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>还没有创建词书</p>
                  <button className="btn-secondary mt-4" onClick={() => setShowWordbookModal(true)}>
                    创建词书
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => { setSelectedWordbook(null); setWordbookWords([]); }}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h3 className="font-semibold text-gray-800">
                  {wordbooks.find((wb) => wb.id === selectedWordbook)?.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                  <h4 className="font-medium text-gray-700 mb-3">词书单词 ({wordbookWords.length})</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {wordbookWords.map((word) => (
                      <div key={word.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{word.word}</div>
                          <div className="text-sm text-gray-500">{word.meaning}</div>
                        </div>
                        <button 
                          className="p-1 hover:bg-red-100 rounded text-red-500"
                          onClick={() => handleRemoveWordFromWordbook(word.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {wordbookWords.length === 0 && (
                      <p className="text-center text-gray-500 py-4">词书为空</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h4 className="font-medium text-gray-700 mb-3">添加单词到词书</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {words.filter((w) => !isWordInWordbook(w.id)).slice(0, 20).map((word) => (
                      <div key={word.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{word.word}</div>
                          <div className="text-sm text-gray-500">{word.meaning}</div>
                        </div>
                        <button 
                          className="p-1 hover:bg-green-100 rounded text-green-500"
                          onClick={() => handleAddWordToWordbook(word.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

      {showWordbookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">创建新词书</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setShowWordbookModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">词书名称</label>
                <input
                  type="text"
                  className="input-field"
                  value={newWordbook.name}
                  onChange={(e) => setNewWordbook({ ...newWordbook, name: e.target.value })}
                  placeholder="输入词书名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={newWordbook.description}
                  onChange={(e) => setNewWordbook({ ...newWordbook, description: e.target.value })}
                  placeholder="输入词书描述"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex-1 btn-secondary" onClick={() => setShowWordbookModal(false)}>
                取消
              </button>
              <button className="flex-1 btn-primary" onClick={handleCreateWordbook}>
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
