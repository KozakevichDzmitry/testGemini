import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, BookOpen, GraduationCap, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Search, Volume2, Settings, Keyboard, MousePointerClick, ArrowRightLeft } from 'lucide-react';
import { generateVocabulary } from './services/geminiService';
import { VocabularyItem, AppView, DifficultyLevel, QuizMode, QuizDirection } from './types';
import { Button } from './components/Button';
import { Flashcard } from './components/Flashcard';

// --- Constants ---
const SUGGESTED_TOPICS = [
  "Travel & Airports", "Job Interview", "Restaurant & Food", 
  "Tech & Startups", "Daily Routine", "Shopping"
];

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>(AppView.GENERATE);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.INTERMEDIATE);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz Configuration State
  const [quizMode, setQuizMode] = useState<QuizMode>(QuizMode.MULTIPLE_CHOICE);
  const [quizDirection, setQuizDirection] = useState<QuizDirection>(QuizDirection.EN_RU);

  // Learning State
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Quiz State
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  
  // Text Input Quiz State
  const [textInput, setTextInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateVocabulary(topic, difficulty);
      setItems(data);
      setView(AppView.LEARN);
      setCurrentIndex(0);
    } catch (err) {
      setError("Не удалось сгенерировать слова. Пожалуйста, проверьте подключение или попробуйте другую тему.");
    } finally {
      setIsLoading(false);
    }
  }, [topic, difficulty]);

  const goToQuizSetup = () => {
    setView(AppView.QUIZ_SETUP);
  };

  const startQuiz = () => {
    setScore(0);
    setCurrentIndex(0);
    setQuizFinished(false);
    prepareQuizQuestion(0);
    setView(AppView.QUIZ);
  };

  const prepareQuizQuestion = (index: number) => {
    if (index >= items.length) {
      setQuizFinished(true);
      return;
    }
    const currentItem = items[index];
    const isEnRu = quizDirection === QuizDirection.EN_RU;
    const correct = isEnRu ? currentItem.russian : currentItem.english;

    // Reset states
    setSelectedAnswer(null);
    setTextInput('');
    setIsAnswerChecked(false);

    if (quizMode === QuizMode.MULTIPLE_CHOICE) {
        // Create 3 distractors
        const otherItems = items.filter(i => i.english !== currentItem.english);
        const distractors = otherItems
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(i => isEnRu ? i.russian : i.english);
        
        const options = [...distractors, correct].sort(() => 0.5 - Math.random());
        setShuffledOptions(options);
    }
    
    // Auto-focus input in text mode
    if (quizMode === QuizMode.TEXT_INPUT) {
       setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleQuizOptionClick = (answer: string) => {
    if (selectedAnswer) return; // Prevent double click
    setSelectedAnswer(answer);
    
    const currentItem = items[currentIndex];
    const isEnRu = quizDirection === QuizDirection.EN_RU;
    const correct = isEnRu ? currentItem.russian : currentItem.english;

    if (answer === correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      const nextIdx = currentIndex + 1;
      if (nextIdx < items.length) {
        setCurrentIndex(nextIdx);
        prepareQuizQuestion(nextIdx);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  const handleTextAnswerCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswerChecked || !textInput.trim()) return;

    setIsAnswerChecked(true);
    const currentItem = items[currentIndex];
    const isEnRu = quizDirection === QuizDirection.EN_RU;
    const correct = isEnRu ? currentItem.russian : currentItem.english;

    if (textInput.trim().toLowerCase() === correct.toLowerCase()) {
      setScore(s => s + 1);
    }
  };

  const handleTextNext = () => {
      const nextIdx = currentIndex + 1;
      if (nextIdx < items.length) {
        setCurrentIndex(nextIdx);
        prepareQuizQuestion(nextIdx);
      } else {
        setQuizFinished(true);
      }
  };

  // Allow pressing Enter to check or next
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        if (!isAnswerChecked) {
            handleTextAnswerCheck();
        } else {
            handleTextNext();
        }
    }
  };

  // --- Render Views ---

  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(AppView.GENERATE)}>
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">Lingua<span className="text-blue-600">Flow</span></span>
        </div>
        
        {items.length > 0 && (
          <nav className="flex gap-1 sm:gap-2">
            <button 
              onClick={() => setView(AppView.LEARN)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === AppView.LEARN ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Учить
            </button>
            <button 
              onClick={goToQuizSetup}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === AppView.QUIZ || view === AppView.QUIZ_SETUP ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Тест
            </button>
          </nav>
        )}
      </div>
    </header>
  );

  const renderGenerate = () => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Учите английский с <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
        </h1>
        <p className="text-lg text-slate-600">
          Создавайте персонализированные списки слов и выражений на любую тему за секунды.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">О чем хотите поговорить?</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Например: Coffee culture, Space travel, Marketing..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.map(t => (
              <button 
                key={t}
                onClick={() => setTopic(t)}
                className="px-3 py-1 bg-slate-50 text-slate-600 text-xs rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Ваш уровень</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(DifficultyLevel).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                  difficulty === level 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {level.split(' ')[0]}
                <span className="block text-xs opacity-75 mt-0.5">{level.split('(')[1].replace(')', '')}</span>
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          isLoading={isLoading} 
          disabled={!topic.trim()}
          className="w-full"
        >
          {isLoading ? 'Генерируем...' : 'Создать урок'}
        </Button>
      </div>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center border border-red-100">
          {error}
        </div>
      )}
    </div>
  );

  const renderLearn = () => (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-blue-500" />
          Карточки
        </h2>
        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex + 1} из {items.length}
        </span>
      </div>

      <div className="mb-8">
        <Flashcard item={items[currentIndex]} />
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          variant="secondary"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="w-14 h-14 !p-0 rounded-full"
        >
          <ChevronLeft />
        </Button>
        <Button 
          variant="primary"
          onClick={() => setCurrentIndex(prev => Math.min(items.length - 1, prev + 1))}
          disabled={currentIndex === items.length - 1}
          className="w-14 h-14 !p-0 rounded-full shadow-lg shadow-blue-200"
        >
          <ChevronRight />
        </Button>
      </div>
      
      <div className="mt-12 text-center">
        <button 
          onClick={goToQuizSetup}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
        >
          Готовы проверить себя? Перейти к тесту &rarr;
        </button>
      </div>
    </div>
  );

  const renderQuizSetup = () => (
    <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="text-blue-600" /> Настройка теста
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Режим тестирования</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setQuizMode(QuizMode.MULTIPLE_CHOICE)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                quizMode === QuizMode.MULTIPLE_CHOICE
                                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <MousePointerClick className="mb-2 opacity-80" />
                            <div className="font-semibold">Выбор ответа</div>
                            <div className="text-xs opacity-70 mt-1">Выберите правильный вариант из предложенных</div>
                        </button>
                        <button
                            onClick={() => setQuizMode(QuizMode.TEXT_INPUT)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                quizMode === QuizMode.TEXT_INPUT
                                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <Keyboard className="mb-2 opacity-80" />
                            <div className="font-semibold">Ввод текста</div>
                            <div className="text-xs opacity-70 mt-1">Введите правильный перевод вручную</div>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Направление перевода</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setQuizDirection(QuizDirection.EN_RU)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                quizDirection === QuizDirection.EN_RU
                                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                <span>🇬🇧</span> <ArrowRightLeft size={16} /> <span>🇷🇺</span>
                            </div>
                            <div className="font-semibold">EN → RU</div>
                        </button>
                        <button
                            onClick={() => setQuizDirection(QuizDirection.RU_EN)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                                quizDirection === QuizDirection.RU_EN
                                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                             <div className="flex items-center gap-2 mb-2 opacity-80">
                                <span>🇷🇺</span> <ArrowRightLeft size={16} /> <span>🇬🇧</span>
                            </div>
                            <div className="font-semibold">RU → EN</div>
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={startQuiz} className="w-full">
                        Начать тест
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderQuiz = () => {
    if (quizFinished) {
      const percentage = Math.round((score / items.length) * 100);
      return (
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Тест завершен!</h2>
            <p className="text-slate-600 mb-6">Вы ответили правильно на {score} из {items.length} вопросов.</p>
            
            <div className="text-5xl font-extrabold text-blue-600 mb-8">
              {percentage}%
            </div>

            <div className="space-y-3">
              <Button onClick={startQuiz} className="w-full">
                Попробовать снова
              </Button>
              <Button variant="secondary" onClick={() => setView(AppView.GENERATE)} className="w-full">
                Новая тема
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const currentItem = items[currentIndex];
    const isEnRu = quizDirection === QuizDirection.EN_RU;
    const questionText = isEnRu ? currentItem.english : currentItem.russian;
    const answerText = isEnRu ? currentItem.russian : currentItem.english;

    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex) / items.length) * 100}%` }}
          />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mb-6 text-center">
          <h3 className="text-sm uppercase tracking-widest text-slate-400 font-semibold mb-4">
             {isEnRu ? 'Как переводится?' : 'Напишите на английском'}
          </h3>
          <p className="text-3xl font-bold text-slate-800 mb-2">{questionText}</p>
          
          {isEnRu && (
              <button 
                 onClick={() => {
                    const u = new SpeechSynthesisUtterance(questionText);
                    u.lang = 'en-US';
                    window.speechSynthesis.speak(u);
                 }}
                 className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm mt-2 font-medium"
              >
                <Volume2 size={16} /> Прослушать
              </button>
          )}
        </div>

        {/* Text Input Mode */}
        {quizMode === QuizMode.TEXT_INPUT && (
             <div className="space-y-4">
                 <input
                    ref={inputRef}
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAnswerChecked}
                    placeholder="Введите ответ..."
                    className={`w-full p-4 text-lg rounded-xl border-2 outline-none transition-all text-center
                        ${isAnswerChecked 
                            ? (textInput.trim().toLowerCase() === answerText.toLowerCase() 
                                ? 'border-green-500 bg-green-50 text-green-900' 
                                : 'border-red-500 bg-red-50 text-red-900')
                            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
                        }
                    `}
                    autoComplete="off"
                 />
                 
                 {isAnswerChecked && (
                    <div className={`p-4 rounded-xl text-center ${
                        textInput.trim().toLowerCase() === answerText.toLowerCase()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                        <p className="font-medium text-sm mb-1">Правильный ответ:</p>
                        <p className="font-bold text-lg">{answerText}</p>
                    </div>
                 )}

                 <Button 
                    onClick={isAnswerChecked ? handleTextNext : handleTextAnswerCheck} 
                    className="w-full"
                    disabled={!textInput.trim() && !isAnswerChecked}
                 >
                    {isAnswerChecked ? 'Далее' : 'Проверить'}
                 </Button>
             </div>
        )}

        {/* Multiple Choice Mode */}
        {quizMode === QuizMode.MULTIPLE_CHOICE && (
            <div className="grid grid-cols-1 gap-3">
              {shuffledOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === answerText;
                
                let btnClass = "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50";
                let icon = null;

                if (selectedAnswer) {
                  if (isCorrect) {
                    btnClass = "bg-green-50 border-green-500 text-green-700";
                    icon = <CheckCircle2 size={20} className="text-green-600" />;
                  } else if (isSelected) {
                    btnClass = "bg-red-50 border-red-500 text-red-700";
                    icon = <XCircle size={20} className="text-red-600" />;
                  } else {
                    btnClass = "opacity-50 border-slate-100 bg-slate-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizOptionClick(option)}
                    disabled={!!selectedAnswer}
                    className={`p-4 rounded-xl border-2 text-left font-medium text-lg transition-all flex justify-between items-center ${btnClass}`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-12">
      {renderHeader()}
      <main>
        {view === AppView.GENERATE && renderGenerate()}
        {view === AppView.LEARN && renderLearn()}
        {view === AppView.QUIZ_SETUP && renderQuizSetup()}
        {view === AppView.QUIZ && renderQuiz()}
      </main>
    </div>
  );
};

export default App;