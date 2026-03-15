import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../hooks/useAuth';

interface Question {
  id: string;
  question: string;
  options: string[];
  points: number;
  category: string;
}

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { updatePoints } = useAuthStore();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await api.get('/quiz/questions?count=5');
      const questionsData = response.data.questions.map((q: any) => ({
        ...q,
        options: JSON.parse(q.options),
      }));
      setQuestions(questionsData);
      setLoading(false);
    } catch (error) {
      console.error('加载题目失败:', error);
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null) return;

    setAnswerLoading(true);
    try {
      const response = await api.post('/quiz/answer', {
        questionId: questions[currentIndex].id,
        answer: selectedAnswer,
      });

      setResult(response.data);
      setShowResult(true);

      if (response.data.isCorrect) {
        setScore(score + response.data.pointsEarned);
        updatePoints(response.data.pointsEarned);
      }
    } catch (error) {
      console.error('答题失败:', error);
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setResult(null);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setResult(null);
    setScore(0);
    setFinished(false);
    setLoading(true);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center bounce-in-animation">
          <div className="relative inline-block mb-6">
            <span className="text-8xl float-animation inline-block">📚</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">正在加载题目...</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto bounce-in-animation">
        <div className="card p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
          
          <div className="relative">
            <div className="text-9xl mb-6 float-animation inline-block">🎉</div>
            <h2 className="text-4xl font-bold gradient-text mb-6">答题完成！</h2>
            
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 mb-8 border-2 border-red-100 relative">
              <div className="absolute top-4 right-4 text-4xl opacity-20">⭐</div>
              <div className="text-7xl font-bold gradient-text mb-3">{score}</div>
              <div className="text-gray-600 text-lg font-medium">获得积分</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-gray-600 text-sm">答题数</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((score / (questions.reduce((sum, q) => sum + q.points, 0))) * 100) || 0}%
                </div>
                <div className="text-gray-600 text-sm">正确率</div>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="btn-primary px-10 py-4 text-lg"
            >
              再来一轮
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">答题闯关</h2>
          <p className="text-gray-600">回答问题，赢取积分</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold gradient-text">{currentIndex + 1}/{questions.length}</div>
          <div className="text-gray-500 text-sm">当前进度</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-red-500/30">
                {currentQuestion.category}
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <span className="text-xl">⭐</span>
                <span className="font-semibold">{currentQuestion.points} 积分</span>
              </span>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = showResult && result?.correctAnswer === index;
              const isWrong = showResult && isSelected && !result.isCorrect;
              
              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/20'
                      : isWrong
                      ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/20'
                      : isSelected
                      ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/20 scale-102'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50 hover:shadow-lg'
                  } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      isCorrect
                        ? 'bg-green-500 text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {isCorrect ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-800 font-medium text-lg">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`p-6 rounded-xl mb-6 border-2 ${
              result.isCorrect 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{result.isCorrect ? '🎉' : '😢'}</span>
                <div>
                  <div className={`font-bold text-lg ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {result.isCorrect ? '回答正确！' : '回答错误'}
                  </div>
                  {result.isCorrect && (
                    <div className="text-green-600 font-semibold mt-1">
                      获得 {result.pointsEarned} 积分
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            {!showResult ? (
              <button
                onClick={handleAnswer}
                disabled={selectedAnswer === null || answerLoading}
                className="btn-primary px-10 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {answerLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    提交中...
                  </span>
                ) : '提交答案'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary px-10 py-4 text-lg"
              >
                {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
                <span className="ml-2">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}