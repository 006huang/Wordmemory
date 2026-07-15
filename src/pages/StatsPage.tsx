import { useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useWordStore } from '../store/wordStore';
import { categories } from '../data/mockWords';
import { BookOpen, CheckCircle, Clock, Target } from 'lucide-react';

export const StatsPage = () => {
  const { words, learningRecords, fetchWords, fetchLearningRecords } = useWordStore();

  useEffect(() => {
    fetchWords();
    fetchLearningRecords();
  }, [fetchWords, fetchLearningRecords]);

  const masteredCount = learningRecords.filter((r) => r.status === 'mastered').length;
  const learningCount = learningRecords.filter((r) => r.status === 'learning').length;
  const newCount = words.length - masteredCount - learningCount;

  const categoryStats = categories.map((cat) => ({
    name: cat.name,
    value: words.filter((w) => w.category === cat.name).length,
  }));

  const difficultyStats = [
    { name: '简单', value: words.filter((w) => w.difficulty === 'easy').length },
    { name: '中等', value: words.filter((w) => w.difficulty === 'medium').length },
    { name: '困难', value: words.filter((w) => w.difficulty === 'hard').length },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  const weeklyData = [
    { day: '周一', learned: 12, reviewed: 20 },
    { day: '周二', learned: 8, reviewed: 15 },
    { day: '周三', learned: 15, reviewed: 25 },
    { day: '周四', learned: 10, reviewed: 18 },
    { day: '周五', learned: 18, reviewed: 30 },
    { day: '周六', learned: 20, reviewed: 35 },
    { day: '周日', learned: 14, reviewed: 28 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">学习统计</h1>
        <p className="text-gray-600">追踪你的学习进度和成果</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{words.length}</div>
          <div className="text-sm text-gray-600">总单词</div>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{masteredCount}</div>
          <div className="text-sm text-gray-600">已掌握</div>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{learningCount}</div>
          <div className="text-sm text-gray-600">学习中</div>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target className="w-6 h-6 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-600">{newCount}</div>
          <div className="text-sm text-gray-600">未学习</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">分类分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} 个单词`, '数量']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">难度分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {difficultyStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} 个单词`, '数量']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">本周学习情况</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="learned" stroke="#3b82f6" name="新学" strokeWidth={2} />
              <Line type="monotone" dataKey="reviewed" stroke="#10b981" name="复习" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">学习进度</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">总体进度</span>
              <span className="text-gray-700 font-medium">{((masteredCount + learningCount) / words.length * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((masteredCount + learningCount) / words.length * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">已掌握</span>
              <span className="text-green-600 font-medium">{(masteredCount / words.length * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(masteredCount / words.length * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">学习中</span>
              <span className="text-yellow-600 font-medium">{(learningCount / words.length * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(learningCount / words.length * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
