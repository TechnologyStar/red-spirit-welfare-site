import { useState } from 'react';
import api from '../../utils/api';

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'codes' | 'questions' | 'prizes'>('codes');
  
  const [prizeId, setPrizeId] = useState('');
  const [codes, setCodes] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<any>(null);

  const handleAuth = () => {
    if (adminKey) {
      setAuthenticated(true);
      loadStats(adminKey);
    }
  };

  const loadStats = async (key: string) => {
    try {
      const response = await api.get('/admin/stats', {
        headers: { 'x-admin-key': key },
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const handleImportCodes = async () => {
    if (!prizeId || !codes) {
      alert('请填写奖品ID和兑换码');
      return;
    }

    const codeList = codes
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (codeList.length === 0) {
      alert('请输入至少一个兑换码');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        '/admin/codes/import',
        { prizeId, codes: codeList },
        { headers: { 'x-admin-key': adminKey } }
      );
      setImportResult(response.data);
      setCodes('');
      loadStats(adminKey);
    } catch (error: any) {
      alert(error.response?.data?.error || '导入失败');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-6xl">🔐</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">管理员登录</h1>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="请输入管理员密钥"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="gradient-bg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">管理后台</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">用户数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">总积分</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600">题目数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalCards}</div>
              <div className="text-sm text-gray-600">卡片数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPrizes}</div>
              <div className="text-sm text-gray-600">奖品数</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalRedemptions}</div>
              <div className="text-sm text-gray-600">兑换数</div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('codes')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === 'codes'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              导入兑换码
            </button>
          </div>

          {activeTab === 'codes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  奖品ID
                </label>
                <input
                  type="text"
                  value={prizeId}
                  onChange={(e) => setPrizeId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="例如: p1, p2, p3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  兑换码（每行一个）
                </label>
                <textarea
                  value={codes}
                  onChange={(e) => setCodes(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono"
                  placeholder="CODE1&#10;CODE2&#10;CODE3&#10;..."
                />
              </div>

              <button
                onClick={handleImportCodes}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? '导入中...' : '导入兑换码'}
              </button>

              {importResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-800 mb-2">导入完成</div>
                  <div className="text-sm text-green-700">
                    <p>成功导入: {importResult.imported} 个</p>
                    <p>重复跳过: {importResult.duplicates} 个</p>
                    <p>总计: {importResult.total} 个</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
