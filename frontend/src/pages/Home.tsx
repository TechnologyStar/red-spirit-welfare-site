import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

const features = [
  {
    title: '答题闯关',
    description: '回答红色精神相关问题，获取积分奖励',
    icon: '❓',
    path: '/quiz',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    shadow: 'shadow-blue-500/30',
    stats: '10分/题',
  },
  {
    title: '集卡活动',
    description: '收集红色主题卡片，集齐有惊喜',
    icon: '🃏',
    path: '/cards',
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
    shadow: 'shadow-purple-500/30',
    stats: '500分大奖',
  },
  {
    title: '趣味游戏',
    description: '玩红色主题小游戏，轻松赚积分',
    icon: '🎮',
    path: '/games',
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    shadow: 'shadow-green-500/30',
    stats: '趣味无穷',
  },
  {
    title: '积分商城',
    description: '使用积分兑换精美奖品',
    icon: '🎁',
    path: '/shop',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    shadow: 'shadow-orange-500/30',
    stats: '好礼兑换',
  },
];

const announcements = [
  { text: '欢迎来到红色精神福利站，传承红色基因！', icon: '🎉' },
  { text: '每日答题可获得额外积分奖励', icon: '⭐' },
  { text: '集齐所有卡片可获得500积分大礼包', icon: '🎁' },
  { text: '新增红旗飘飘小游戏，快来挑战吧！', icon: '🎮' },
];

const spiritKnowledge = [
  {
    title: '红船精神',
    icon: '🚢',
    description: '开天辟地、敢为人先的首创精神，坚定理想、百折不挠的奋斗精神，立党为公、忠诚为民的奉献精神。',
  },
  {
    title: '长征精神',
    icon: '🚩',
    description: '不怕牺牲、前赴后继、勇往直前、坚韧不拔、众志成城、团结互助、百折不挠、克服困难。',
  },
  {
    title: '延安精神',
    icon: '⛰️',
    description: '坚定正确的政治方向，解放思想、实事求是的思想路线，全心全意为人民服务的根本宗旨，自力更生、艰苦奋斗的创业精神。',
  },
];

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      <div className="card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-yellow-500/10 to-red-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <span className="text-4xl">👋</span>
              <h2 className="text-3xl font-bold text-gray-800">
                欢迎回来，<span className="gradient-text">{user?.username}</span>！
              </h2>
            </div>
            <p className="text-gray-600 text-lg">继续探索红色精神，传承革命传统</p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text mb-1">
                  {user?.points || 0}
                </div>
                <div className="text-gray-600 font-medium">当前积分</div>
                <div className="mt-2 flex items-center justify-center gap-2 text-sm text-yellow-700">
                  <span>⭐</span>
                  <span>继续努力赚积分</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="text-4xl float-animation inline-block">📢</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-8 animate-marquee whitespace-nowrap">
              {[...announcements, ...announcements].map((item, index) => (
                <span key={index} className="inline-flex items-center gap-2 text-gray-700">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                  <span className="text-gray-300">|</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Link
            key={feature.path}
            to={feature.path}
            className="card overflow-hidden group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`bg-gradient-to-br ${feature.gradient} p-8 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative">
                <span className="text-6xl inline-block group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </span>
              </div>
            </div>
            
            <div className="p-6 relative">
              <div className="absolute top-0 right-4 -translate-y-1/2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${feature.gradient} ${feature.shadow} shadow-lg`}>
                  {feature.stats}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2 mt-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-4 flex items-center text-red-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>立即体验</span>
                <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📖</span>
          <h3 className="text-2xl font-bold text-gray-800">红色精神小知识</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spiritKnowledge.map((item, index) => (
            <div
              key={item.title}
              className="group relative bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-100 hover:border-red-300 transition-all duration-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                {item.icon}
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl float-animation">🚩</span>
            <div>
              <h3 className="text-xl font-bold">传承红色基因</h3>
              <p className="text-red-100">让我们一起弘扬革命精神，争做时代新人</p>
            </div>
          </div>
          <Link
            to="/quiz"
            className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            开始学习
          </Link>
        </div>
      </div>
    </div>
  );
}