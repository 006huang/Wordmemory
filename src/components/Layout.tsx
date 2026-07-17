import { BookOpen, Library, BarChart3, Menu, X, User, LogOut, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWordStore } from '../store/wordStore';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const resetStore = useWordStore((state) => state.resetStore);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const navItems = [
    { path: '/', icon: BookOpen, label: '学习' },
    { path: '/library', icon: Library, label: '词库' },
    { path: '/stats', icon: BarChart3, label: '统计' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    resetStore();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Wordmemory</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full">
                    <User className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-primary-700">{user.username}</span>
                  </div>
                  <button
                    className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">退出</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm">登录</span>
                </Link>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-2 border-t">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="border-t mt-2 pt-2">
                {user ? (
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary-500" />
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <button
                      className="text-red-500"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">登录/注册</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};
