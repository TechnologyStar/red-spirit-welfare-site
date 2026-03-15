import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/quiz', label: '答题', icon: '❓' },
  { path: '/cards', label: '集卡', icon: '🃏' },
  { path: '/games', label: '游戏', icon: '🎮' },
  { path: '/shop', label: '商城', icon: '🎁' },
  { path: '/profile', label: '我的', icon: '👤' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="decorative-bg">
        <div className="decorative-circle" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px' }}></div>
        <div className="decorative-circle" style={{ width: '300px', height: '300px', bottom: '10%', left: '-50px', animationDelay: '2s' }}></div>
        <div className="decorative-circle" style={{ width: '200px', height: '200px', top: '40%', right: '10%', animationDelay: '4s' }}></div>
        <div className="star-decoration" style={{ top: '15%', left: '5%', animationDelay: '0s' }}></div>
        <div className="star-decoration" style={{ top: '60%', right: '8%', animationDelay: '3s' }}></div>
        <div className="star-decoration" style={{ bottom: '20%', left: '15%', animationDelay: '5s' }}></div>
      </div>

      <header className="gradient-bg-hero text-white shadow-2xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="text-4xl float-animation inline-block filter drop-shadow-lg">🚩</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-shadow">红色精神福利站</h1>
                <p className="text-red-100 text-sm">传承红色基因 · 弘扬革命精神</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-5">
              <div className="glass-card px-5 py-2.5 flex items-center space-x-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-xs text-red-100">我的积分</div>
                  <div className="text-xl font-bold">{user?.points || 0}</div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-20 border-b border-red-100/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all duration-300 rounded-xl whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                      : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="slide-up-animation">
          <Outlet />
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-10 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <span className="text-3xl">🚩</span>
              <div>
                <p className="font-semibold text-lg">红色精神福利站</p>
                <p className="text-gray-400 text-sm">传承红色基因，弘扬革命精神</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2024 红色精神福利站 · 用心传承每一份红色记忆
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
