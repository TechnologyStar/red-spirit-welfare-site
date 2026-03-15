import { useState } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../hooks/useAuth';

export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [clicks, setClicks] = useState(0);
  const [gameResult, setGameResult] = useState<any>(null);
  const { user, updatePoints } = useAuthStore();

  const games = [
    {
      id: 'red-flag',
      name: '红旗飘飘',
      description: '快速点击红旗，每10次点击获得1积分',
      icon: '🚩',
    },
    {
      id: 'knowledge-race',
      name: '知识竞速',
      description: '快速回答问题，正确率和速度决定积分',
      icon: '⚡',
    },
  ];

  const handleRedFlagClick = () => {
    setClicks(clicks + 1);
  };

  const submitRedFlagGame = async () => {
    try {
      const response = await api.post('/games/red-flag', { clicks });
      setGameResult(response.data);
      if (response.data.pointsEarned > 0) {
        updatePoints((user?.points || 0) + response.data.pointsEarned);
      }
    } catch (error) {
      console.error('提交游戏失败:', error);
    }
  };

  const resetGame = () => {
    setActiveGame(null);
    setClicks(0);
    setGameResult(null);
  };

  if (activeGame === 'red-flag') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">红旗飘飘</h2>
            <p className="text-gray-600">快速点击红旗获得积分！</p>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-red-600 mb-2">{clicks}</div>
            <div className="text-gray-500">点击次数</div>
          </div>

          {!gameResult ? (
            <>
              <div className="flex justify-center mb-6">
                <button
                  onClick={handleRedFlagClick}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-8xl hover:from-red-600 hover:to-red-800 transition transform hover:scale-105 active:scale-95 shadow-2xl pulse-animation"
                >
                  🚩
                </button>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={submitRedFlagGame}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  结束游戏
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  返回
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  +{gameResult.pointsEarned} 积分
                </div>
                <div className="text-gray-600">{gameResult.message}</div>
              </div>
              <button
                onClick={resetGame}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                再玩一次
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeGame === 'knowledge-race') {
    return <KnowledgeRaceGame onComplete={resetGame} updatePoints={updatePoints} user={user} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">趣味游戏</h2>
        <p className="text-gray-600 mt-1">玩红色主题小游戏，轻松赚积分</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-xl shadow-lg p-6 hover-scale card-shadow"
          >
            <div className="text-center mb-4">
              <span className="text-6xl">{game.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{game.description}</p>
            <button
              onClick={() => setActiveGame(game.id)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition"
            >
              开始游戏
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeRaceGame({ onComplete, updatePoints, user }: any) {
  const [questions] = useState([
    { q: '中华人民共和国成立于哪一年？', a: '1949' },
    { q: '中国共产党的成立年份是？', a: '1921' },
    { q: '红军长征开始于哪一年？', a: '1934' },
    { q: '延安位于哪个省？', a: '陕西' },
    { q: '井冈山位于哪个省？', a: '江西' },
  ]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer.trim() === questions[current].a) {
      setCorrect(correct + 1);
    }

    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setAnswer('');
    } else {
      const timeUsed = Math.floor((Date.now() - startTime) / 1000);
      
      try {
        const response = await api.post('/games/knowledge-race', {
          correctAnswers: correct + (answer.trim() === questions[current].a ? 1 : 0),
          totalQuestions: questions.length,
          timeUsed,
        });
        setResult(response.data);
        updatePoints((user?.points || 0) + response.data.totalPoints);
      } catch (error) {
        console.error('提交游戏失败:', error);
      }
      
      setFinished(true);
    }
  };

  if (finished && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">游戏结束！</h2>
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {result.basePoints} 积分
              </div>
              <div className="text-gray-600 text-sm">基础得分</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                +{result.timeBonus} 积分
              </div>
              <div className="text-gray-600 text-sm">时间奖励</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-600">
                共 {result.totalPoints} 积分
              </div>
            </div>
          </div>
          <button
            onClick={onComplete}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">知识竞速</h2>
          <p className="text-gray-600">
            问题 {current + 1} / {questions.length}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-xl font-semibold text-gray-800 mb-4">
              {questions[current].q}
            </p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="输入答案"
              autoFocus
            />
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              {current < questions.length - 1 ? '下一题' : '完成'}
            </button>
            <button
              type="button"
              onClick={onComplete}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              放弃
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
