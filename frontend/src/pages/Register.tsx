import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../hooks/useAuth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少6个字符');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', { username, password });
      const { token, user } = response.data;
      setAuth(token, user);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-hero flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="decorative-circle" style={{ width: '500px', height: '500px', top: '-200px', left: '-150px' }}></div>
        <div className="decorative-circle" style={{ width: '400px', height: '400px', bottom: '-150px', right: '-100px', animationDelay: '3s' }}></div>
        <div className="star-decoration" style={{ top: '15%', right: '10%', animationDelay: '0s' }}></div>
        <div className="star-decoration" style={{ bottom: '25%', left: '12%', animationDelay: '2s' }}></div>
        <div className="star-decoration" style={{ top: '50%', right: '20%', animationDelay: '4s', width: '15px', height: '15px' }}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10 bounce-in-animation">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <span className="text-7xl float-reverse-animation inline-block filter drop-shadow-xl">⭐</span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mt-5">加入我们</h1>
          <p className="text-gray-500 mt-2">开启红色精神之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl flex items-center">
              <span className="text-xl mr-3">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="3-20个字符"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="至少6个字符"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="再次输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                注册中...
              </span>
            ) : '注册'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-gray-500">已有账号？</span>
          <Link to="/login" className="text-red-600 font-semibold ml-2 hover:text-red-700 transition-colors">
            立即登录
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <span className="flex items-center"><span className="mr-1">🎁</span> 新用户奖励</span>
            <span className="flex items-center"><span className="mr-1">🚀</span> 即刻开始</span>
          </div>
        </div>
      </div>
    </div>
  );
}
