import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../hooks/useAuth';

interface Card {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: string;
  theme: string;
}

interface UserCard {
  id: string;
  card_id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: string;
  theme: string;
  obtained_at: string;
}

const rarityConfig = {
  common: {
    gradient: 'from-gray-400 to-gray-600',
    border: 'border-gray-300',
    shadow: 'shadow-gray-500/30',
    glow: 'shadow-gray-400/50',
    name: '普通',
    stars: 1,
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    border: 'border-blue-300',
    shadow: 'shadow-blue-500/30',
    glow: 'shadow-blue-400/50',
    name: '稀有',
    stars: 2,
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    border: 'border-purple-300',
    shadow: 'shadow-purple-500/30',
    glow: 'shadow-purple-400/50',
    name: '史诗',
    stars: 3,
  },
  legendary: {
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    border: 'border-yellow-300',
    shadow: 'shadow-yellow-500/30',
    glow: 'shadow-orange-400/50',
    name: '传说',
    stars: 5,
  },
};

export default function Cards() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawLoading, setDrawLoading] = useState(false);
  const [drawResult, setDrawResult] = useState<any>(null);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const { user, updatePoints } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cardsRes, myCardsRes] = await Promise.all([
        api.get('/cards/cards'),
        api.get('/cards/my-cards'),
      ]);
      setAllCards(cardsRes.data.cards);
      setMyCards(myCardsRes.data.myCards);
    } catch (error) {
      console.error('加载卡片失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraw = async () => {
    if (!user || user.points < 50) {
      alert('积分不足，需要50积分');
      return;
    }

    setDrawLoading(true);
    try {
      const response = await api.post('/cards/draw');
      setDrawResult(response.data);
      setShowDrawModal(true);
      const newPoints = user.points - 50 + (response.data.bonusPoints || 0);
      updatePoints(newPoints);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || '抽卡失败');
    } finally {
      setDrawLoading(false);
    }
  };

  const hasCard = (cardId: string) => {
    return myCards.some((c) => c.card_id === cardId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center bounce-in-animation">
          <div className="text-7xl mb-4 float-animation inline-block">🃏</div>
          <p className="text-gray-600 text-lg font-medium">正在加载卡片...</p>
        </div>
      </div>
    );
  }

  const collectedCount = new Set(myCards.map((c) => c.card_id)).size;
  const progress = (collectedCount / allCards.length) * 100;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">集卡活动</h2>
          <p className="text-gray-600">收集红色主题卡片，集齐可获得500积分大礼包</p>
        </div>
        <button
          onClick={handleDraw}
          disabled={drawLoading || !user || user.points < 50}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/30">
            {drawLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                抽卡中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-2xl">🎴</span>
                抽卡 (50积分)
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h3 className="font-bold text-gray-800">收集进度</h3>
              <p className="text-sm text-gray-600">
                已收集 <span className="font-bold text-red-600">{collectedCount}</span> / {allCards.length} 张
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold gradient-text">{Math.round(progress)}%</div>
            <div className="text-xs text-gray-500">完成度</div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-1000 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 shimmer"></div>
          </div>
        </div>
        {progress === 100 && (
          <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 flex items-center gap-3 border-2 border-yellow-200">
            <span className="text-4xl float-animation">🎉</span>
            <div>
              <div className="font-bold text-yellow-800">恭喜集齐所有卡片！</div>
              <div className="text-sm text-yellow-700">已获得500积分大礼包</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allCards.map((card) => {
          const owned = hasCard(card.id);
          const config = rarityConfig[card.rarity as keyof typeof rarityConfig] || rarityConfig.common;
          
          return (
            <div
              key={card.id}
              className={`card overflow-hidden group ${owned ? '' : 'opacity-60'}`}
            >
              <div className={`relative h-44 bg-gradient-to-br ${config.gradient} flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>
                
                <div className="relative">
                  <span className="text-7xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {owned ? '🃏' : '?'}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <div className="flex gap-0.5">
                    {[...Array(config.stars)].map((_, i) => (
                      <span key={i} className="text-yellow-300 text-sm drop-shadow">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-5 relative">
                <div className="absolute top-0 right-4 -translate-y-1/2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${config.gradient} ${config.shadow} shadow-lg`}>
                    {config.name}
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-lg mb-2 mt-2">
                  {owned ? card.name : '???'}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {owned ? card.description : '收集此卡片查看详情'}
                </p>
                {owned && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                      {card.theme}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showDrawModal && drawResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full bounce-in-animation">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className={`w-40 h-40 mx-auto rounded-2xl bg-gradient-to-br ${rarityConfig[drawResult.card.rarity as keyof typeof rarityConfig]?.gradient || 'from-gray-400 to-gray-600'} flex items-center justify-center shadow-2xl ${rarityConfig[drawResult.card.rarity as keyof typeof rarityConfig]?.glow}`}>
                  <span className="text-8xl filter drop-shadow-2xl float-animation">🃏</span>
                </div>
                <div className="absolute -top-2 -right-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rarityConfig[drawResult.card.rarity as keyof typeof rarityConfig]?.gradient} shadow-lg`}>
                    {rarityConfig[drawResult.card.rarity as keyof typeof rarityConfig]?.name}
                  </span>
                </div>
              </div>

              <h3 className="text-3xl font-bold gradient-text mb-3">
                {drawResult.card.name}
              </h3>
              <p className="text-gray-600 mb-6">{drawResult.card.description}</p>
              
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-6 border-2 border-red-100">
                <div className="text-sm text-gray-600 mb-1">抽卡消耗</div>
                <div className="text-xl font-bold text-red-600">-50 积分</div>
              </div>

              {drawResult.isComplete && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                  <div className="text-4xl mb-2 float-animation inline-block">🎉</div>
                  <div className="font-bold text-yellow-800 text-lg mb-1">
                    恭喜集齐所有卡片！
                  </div>
                  <div className="text-yellow-700 font-semibold">
                    获得 {drawResult.bonusPoints} 积分奖励
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDrawModal(false)}
                className="btn-primary px-10 py-3"
              >
                太棒了！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}