import { useState, useEffect } from 'react';
import { User, Edit, Lock, Trash2, Calendar, BookOpen, Trophy, Flame, ArrowLeft, Settings, LogOut } from 'lucide-react';
import { api } from '../api/wordApi';
import { useWordStore } from '../store/wordStore';
import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { words, learningRecords, fetchWords, fetchLearningRecords } = useWordStore();
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'settings'>('stats');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [achievements, setAchievements] = useState<{
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
  }>({ streak: 0, totalMastered: 0, totalReviews: 0, learningDays: 0, achievements: [] });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchWords();
    fetchLearningRecords();
    fetchAchievements();
  }, [fetchWords, fetchLearningRecords]);

  const fetchAchievements = async () => {
    const data = await api.getAchievements();
    setAchievements(data);
  };

  const masteredWordIds = new Set(learningRecords.filter((r) => r.status === 'mastered').map((r) => r.wordId));
  const learningWordIds = new Set(learningRecords.filter((r) => r.status === 'learning').map((r) => r.wordId));
  const masteredCount = masteredWordIds.size;
  const learningCount = learningWordIds.size;
  const newCount = Math.max(0, words.length - masteredCount - learningCount);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('密码长度至少6位');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ oldPassword, newPassword })
        });
        const data = await response.json();
        if (response.ok) {
          setPasswordSuccess('密码修改成功');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => setShowChangePassword(false), 2000);
        } else {
          setPasswordError(data.error || '修改失败');
        }
      }
    } catch {
      setPasswordError('网络错误');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useWordStore.getState().resetStore();
    navigate('/');
  };

  const handleClearData = async () => {
    if (!window.confirm('确定要清除所有学习数据吗？此操作无法恢复！')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/clear-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          useWordStore.getState().clearLearningData();
          setAchievements({
            streak: 0,
            totalMastered: 0,
            totalReviews: 0,
            learningDays: 0,
            achievements: []
          });
        } else {
          alert('清除失败');
        }
      }
    } catch {
      alert('网络错误');
    }
  };

  const tabs = [
    { id: 'stats', label: '学习统计', icon: BookOpen },
    { id: 'achievements', label: '成就', icon: Trophy },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          className="p-2 rounded-lg hover:bg-gray-100"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">个人主页</h1>
      </div>

      <div className="card mb-6 p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{user?.username || '用户'}</h2>
            <p className="text-gray-500">ID: {user?.id?.slice(0, 8)}...</p>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">退出登录</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{words.length}</div>
            <div className="text-sm text-gray-500">总单词</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{masteredCount}</div>
            <div className="text-sm text-gray-500">已掌握</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{learningCount}</div>
            <div className="text-sm text-gray-500">学习中</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500">{newCount}</div>
            <div className="text-sm text-gray-500">未学习</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab(tab.id as 'stats' | 'achievements' | 'settings')}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">学习进度</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">总体进度</span>
                  <span className="text-gray-700 font-medium">
                    {words.length > 0 ? Math.min(100, ((masteredCount + learningCount) / words.length * 100)).toFixed(0) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${words.length > 0 ? Math.min(100, ((masteredCount + learningCount) / words.length * 100)) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">已掌握</span>
                  <span className="text-green-600 font-medium">
                    {words.length > 0 ? Math.min(100, (masteredCount / words.length * 100)).toFixed(0) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${words.length > 0 ? Math.min(100, (masteredCount / words.length * 100)) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">学习中</span>
                  <span className="text-yellow-600 font-medium">
                    {words.length > 0 ? Math.min(100, (learningCount / words.length * 100)).toFixed(0) : '0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${words.length > 0 ? Math.min(100, (learningCount / words.length * 100)) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{achievements.streak}</div>
                  <div className="text-sm text-gray-500">连续学习天数</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{achievements.learningDays}</div>
                  <div className="text-sm text-gray-500">累计学习天数</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">最近学习记录</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {learningRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{record.word}</div>
                    <div className="text-sm text-gray-500">
                      {record.lastReviewAt ? `上次复习: ${new Date(record.lastReviewAt).toLocaleDateString()}` : '从未复习'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'mastered' ? 'bg-green-100 text-green-700' :
                    record.status === 'learning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {record.status === 'mastered' ? '已掌握' : record.status === 'learning' ? '学习中' : '新单词'}
                  </span>
                </div>
              ))}
              {learningRecords.length === 0 && (
                <div className="text-center text-gray-500 py-8">暂无学习记录</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{achievements.streak}</div>
              <div className="text-sm text-gray-600">连续学习天数</div>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">{achievements.totalMastered}</div>
              <div className="text-sm text-gray-600">累计掌握单词</div>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{achievements.totalReviews}</div>
              <div className="text-sm text-gray-600">累计复习次数</div>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{achievements.learningDays}</div>
              <div className="text-sm text-gray-600">学习天数</div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">获得的成就</h3>
            {achievements.achievements.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {achievements.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="card p-3 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="font-semibold text-gray-800 text-sm">{achievement.name}</div>
                    <div className="text-xs text-gray-500">{achievement.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>还没有获得任何成就</p>
                <p className="text-sm">开始学习来解锁成就吧！</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">成就进度</h3>
            <div className="space-y-3">
              {[
                { id: 'first_steps', name: '初学者', description: '掌握10个单词', target: 10, current: masteredCount, icon: '🌱' },
                { id: 'word_collector', name: '词汇收藏家', description: '掌握50个单词', target: 50, current: masteredCount, icon: '📚' },
                { id: 'vocabulary_master', name: '词汇大师', description: '掌握100个单词', target: 100, current: masteredCount, icon: '🏆' },
                { id: 'streak_3', name: '坚持不懈', description: '连续学习3天', target: 3, current: achievements.streak, icon: '🔥' },
                { id: 'streak_7', name: '一周达人', description: '连续学习7天', target: 7, current: achievements.streak, icon: '⭐' },
                { id: 'streak_30', name: '月度冠军', description: '连续学习30天', target: 30, current: achievements.streak, icon: '👑' },
              ].map((item) => {
                const progress = Math.min(100, (item.current / item.target) * 100);
                const isUnlocked = item.current >= item.target;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="text-2xl opacity={isUnlocked ? 1 : 0.4}">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-medium ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-500">{item.current}/{item.target}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{item.description}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isUnlocked ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">账户设置</h3>
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">修改密码</div>
                  <div className="text-sm text-gray-500">保护您的账户安全</div>
                </div>
              </div>
              <Edit className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {showChangePassword && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="输入当前密码"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="输入新密码（至少6位）"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    className="input-field"
                    required
                  />
                </div>
                {passwordError && (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center">
                    {passwordSuccess}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 btn-secondary"
                    onClick={() => {
                      setShowChangePassword(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                      setPasswordSuccess('');
                    }}
                  >
                    取消
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    保存
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">数据管理</h3>
            
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-lg transition-colors text-red-600"
              onClick={handleClearData}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">清除学习数据</div>
                  <div className="text-sm text-gray-500">删除所有学习记录，无法恢复</div>
                </div>
              </div>
            </button>
          </div>

          <div className="card bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">关于</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>版本: 1.0.0</p>
              <p>开发团队: Wordmemory</p>
              <p>技术栈: React + TypeScript + Flask</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};