import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../hooks/useAuth';

interface Prize {
  id: string;
  name: string;
  description: string;
  image_url: string;
  points_required: number;
  stock: number;
}

export default function Shop() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<any>(null);
  const { user, updatePoints } = useAuthStore();

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      const response = await api.get('/redemption/prizes');
      setPrizes(response.data.prizes);
    } catch (error) {
      console.error('加载奖品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedPrize) return;

    setRedeemLoading(true);
    try {
      const response = await api.post('/redemption/redeem', {
        prizeId: selectedPrize.id,
      });
      setRedeemResult(response.data);
      updatePoints((user?.points || 0) - selectedPrize.points_required);
      loadPrizes();
    } catch (error: any) {
      alert(error.response?.data?.error || '兑换失败');
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-6xl mb-4 float-animation">🎁</div>
          <p className="text-gray-600">正在加载奖品...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">积分商城</h2>
        <p className="text-gray-600 mt-1">
          当前积分: <span className="font-bold text-red-600">{user?.points || 0}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {prizes.map((prize) => {
          const canRedeem = user && user.points >= prize.points_required && prize.stock > 0;
          return (
            <div
              key={prize.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover-scale card-shadow"
            >
              <div className="h-40 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <span className="text-7xl">🎁</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2">{prize.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{prize.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-red-600 font-bold">
                    {prize.points_required} 积分
                  </div>
                  <div className="text-gray-500 text-sm">
                    库存: {prize.stock}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPrize(prize);
                    setRedeemResult(null);
                  }}
                  disabled={!canRedeem}
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    canRedeem
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {prize.stock === 0
                    ? '已售罄'
                    : canRedeem
                    ? '兑换'
                    : '积分不足'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPrize && !redeemResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">确认兑换</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="font-semibold text-gray-800 mb-2">
                {selectedPrize.name}
              </div>
              <div className="text-gray-600 text-sm mb-2">
                {selectedPrize.description}
              </div>
              <div className="text-red-600 font-bold">
                {selectedPrize.points_required} 积分
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleRedeem}
                disabled={redeemLoading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {redeemLoading ? '兑换中...' : '确认兑换'}
              </button>
              <button
                onClick={() => setSelectedPrize(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {redeemResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">兑换成功！</h3>
            <p className="text-gray-600 mb-4">{redeemResult.message}</p>
            {redeemResult.redemption.code && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">兑换码</div>
                <div className="text-2xl font-mono font-bold text-green-600">
                  {redeemResult.redemption.code}
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setSelectedPrize(null);
                setRedeemResult(null);
              }}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
