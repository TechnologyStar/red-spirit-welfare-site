import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../hooks/useAuth';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface Redemption {
  id: string;
  prize_name: string;
  prize_description: string;
  redemption_code: string;
  points_spent: number;
  redeemed_at: string;
}

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'redemptions'>('transactions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transRes, redemptionsRes] = await Promise.all([
        api.get('/points/transactions'),
        api.get('/redemption/my-redemptions'),
      ]);
      setTransactions(transRes.data.transactions);
      setRedemptions(redemptionsRes.data.redemptions);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 float-animation">👤</div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-3xl">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.username}</h2>
              <p className="text-gray-600">红色精神传承者</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            退出登录
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {user?.points || 0}
            </div>
            <div className="text-gray-600">当前积分</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {transactions.filter((t) => t.type === 'earn').length}
            </div>
            <div className="text-gray-600">获得次数</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {redemptions.length}
            </div>
            <div className="text-gray-600">兑换次数</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'transactions'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            积分记录
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'redemptions'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            兑换记录
          </button>
        </div>

        {activeTab === 'transactions' && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无积分记录</p>
            ) : (
              transactions.map((trans) => (
                <div
                  key={trans.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {trans.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(trans.created_at)}
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      trans.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trans.amount > 0 ? '+' : ''}
                    {trans.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'redemptions' && (
          <div className="space-y-3">
            {redemptions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无兑换记录</p>
            ) : (
              redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-800">
                      {redemption.prize_name}
                    </div>
                    <div className="text-red-600 font-bold">
                      -{redemption.points_spent} 积分
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {redemption.prize_description}
                  </div>
                  {redemption.redemption_code && (
                    <div className="text-sm">
                      <span className="text-gray-500">兑换码: </span>
                      <span className="font-mono font-semibold text-green-600">
                        {redemption.redemption_code}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    {formatDate(redemption.redeemed_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
