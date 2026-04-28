import React, { useState, useEffect, useRef } from 'react';
import { QUESTION_BANK } from '../data/questions';
import './QuizGame.css';
import ExitConfirmModal from './ExitConfirmModal';
import { playSound } from '../utils/audio';

const MAX_LIVES = 3;


const DIFFICULTIES = {
  easy: { label: 'Easy', time: 12, color: '#22c55e', desc: 'Relaxed mode for beginners', icon: '😌' },
  medium: { label: 'Medium', time: 8, color: '#eab308', desc: 'Balanced challenge', icon: '⚡' },
  hard: { label: 'Hard', time: 5, color: '#ef4444', desc: 'Fast and intense gameplay', icon: '🔥' },
};

const POSITIVE_MSGS = ['Nice!', 'Great!', 'Awesome!', 'Correct!'];
const NEGATIVE_MSGS = ['Try again!', 'Oops!', 'Not quite!'];

const CATEGORY_INFO = [
  {
    id: 'Maths', icon: '➗', desc: 'Test your calculation skills', color: '#a855f7',
    subcategories: [
      { id: 'Arithmetic', icon: '🔢', desc: 'Basic calculations' },
      { id: 'Algebra', icon: '📐', desc: 'Equations and variables' },
      { id: 'Logic', icon: '🧩', desc: 'Logical puzzles' }
    ]
  },
  {
    id: 'Science', icon: '🧪', desc: 'Explore the world of science', color: '#22c55e',
    subcategories: [
      { id: 'Space', icon: '🚀', desc: 'Planets and galaxies' },
      { id: 'Biology', icon: '🧬', desc: 'The study of life' }
    ]
  },
  {
    id: 'General Knowledge', icon: '🌍', desc: 'Expand your worldly facts', color: '#3b82f6',
    subcategories: [
      { id: 'World', icon: '🗺️', desc: 'Geography and history' }
    ]
  },
  {
    id: 'Programming', icon: '💻', desc: 'Challenge your coding knowledge', color: '#06b6d4',
    subcategories: [
      { id: 'Web', icon: '🌐', desc: 'HTML, CSS, JS' },
      { id: 'Python', icon: '🐍', desc: 'Python programming' }
    ]
  },
  {
    id: 'Anime', icon: '🍱', desc: 'The world of Japanese animation', color: '#ec4899',
    subcategories: [
      { id: 'Shonen', icon: '⚔️', desc: 'Action and adventure' }
    ]
  },
  {
    id: 'Movies', icon: '🎬', desc: 'The magic of the silver screen', color: '#f59e0b',
    subcategories: [
      { id: 'Hollywood', icon: '🌟', desc: 'Mainstream blockbusters' }
    ]
  },
  {
    id: 'Sports', icon: '🏅', desc: 'Global athletic challenges', color: '#10b981',
    subcategories: [
      { id: 'Football', icon: '⚽', desc: 'The beautiful game' },
      { id: 'Cricket', icon: '🏏', desc: 'Bat and ball challenge' },
      { id: 'Basketball', icon: '🏀', desc: 'Hoops and dunks' },
      { id: 'Tennis', icon: '🎾', desc: 'Grand slam trivia' },
      { id: 'Olympics', icon: '🏅', desc: 'Global games history' }
    ]
  },
  {
    id: 'History', icon: '📜', desc: 'Journey through time', color: '#fbbf24',
    subcategories: [
      { id: 'Ancient', icon: '🗿', desc: 'World civilizations' }
    ]
  },
  {
    id: 'Geography', icon: '🏔️', desc: 'Discover the world', color: '#ef4444',
    subcategories: [
      { id: 'Continents', icon: '🗺️', desc: 'Landmarks and borders' }
    ]
  },
  {
    id: 'Music', icon: '🎵', desc: 'Melodies and legends', color: '#6366f1',
    subcategories: [
      { id: 'Rock', icon: '🎸', desc: 'Classic anthems' }
    ]
  }
];

// Helper to shuffle an array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate a random set of questions tightly coupled to the chosen Category, Subcategory & Difficulty
// Seeded for Daily Challenge consistency if needed
function generateQuiz(categoryKey, subKey, difficultyKey, seed = null) {
  console.log(`%c[QUIZ INIT] Target -> Cat: ${categoryKey}, Sub: ${subKey}, Diff: ${difficultyKey}`, 'color: #38bdf8; font-weight: bold');

  // ── 1. Gather Questions with Fallback ──
  let pool = [];
  const exactMatch = QUESTION_BANK[categoryKey]?.[subKey]?.[difficultyKey] || [];
  pool = [...exactMatch];

  if (pool.length < 10) {
    const diffs = ['easy', 'medium', 'hard'];
    diffs.forEach(d => {
      if (d !== difficultyKey) pool = [...pool, ...(QUESTION_BANK[categoryKey]?.[subKey]?.[d] || [])];
    });
  }
  if (pool.length < 10) {
    const categoryData = QUESTION_BANK[categoryKey] || {};
    Object.keys(categoryData).forEach(s => {
      if (s !== subKey) {
        ['easy', 'medium', 'hard'].forEach(d => {
          pool = [...pool, ...(categoryData[s]?.[d] || [])];
        });
      }
    });
  }
  if (pool.length < 10) {
    pool = [...pool, ...(QUESTION_BANK['General Knowledge']?.['World']?.['easy'] || [])];
  }

  // ── 2. Deduplicate ──
  const uniquePool = [];
  const textSeen = new Set();
  pool.forEach(q => {
    if (!textSeen.has(q.question)) {
      uniquePool.push(q);
      textSeen.add(q.question);
    }
  });

  // ── 3. Filter by 'Seen' Tracker ──
  const seenIds = JSON.parse(localStorage.getItem('mq_seen_questions') || '[]');
  let filteredPool = uniquePool.filter(q => !seenIds.includes(q.question));

  if (filteredPool.length < 5) {
    const newSeen = seenIds.filter(id => !uniquePool.some(q => q.question === id));
    localStorage.setItem('mq_seen_questions', JSON.stringify(newSeen));
    filteredPool = uniquePool;
  }

  // ── 4. Shuffle Logic ──
  const seededShuffle = (array) => {
    if (!seed) return shuffleArray(array);
    const arr = [...array];
    let m = arr.length, t, i;
    let sVal = seed;
    while (m) {
      sVal = (sVal * 9301 + 49297) % 233280;
      i = Math.floor((sVal / 233280) * m--);
      t = arr[m]; arr[m] = arr[i]; arr[i] = t;
    }
    return arr;
  };

  const finalPool = seededShuffle(filteredPool).slice(0, 10);

  // Mark as seen
  if (!seed) {
    const updatedSeen = [...new Set([...seenIds, ...finalPool.map(q => q.question)])];
    localStorage.setItem('mq_seen_questions', JSON.stringify(updatedSeen.slice(-500))); // Keep last 500
  }

  return finalPool.map((q) => {
    const shuffledOptions = seededShuffle(q.options);
    return {
      ...q,
      options: shuffledOptions,
      correct: shuffledOptions.indexOf(q.correctAnswer),
    };
  });
}

// Renders heart icons: always shows MAX_LIVES slots; filled for remaining
function Hearts({ lives }) {
  return (
    <span className="quiz-lives">
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <span
          key={i}
          className={`quiz-heart ${i < lives ? '' : 'quiz-heart--lost'}`}
        >
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </span>
  );
}

function QuizGame({ onBack }) {
  const [phase, setPhase] = useState('category_select'); // category_select | topic_select | ready | question | feedback | end | error
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // for category selection UI

  // Scroll lock effect during active gameplay
  useEffect(() => {
    const gameplayPhases = ['ready', 'question', 'feedback'];
    if (gameplayPhases.includes(phase)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [phase]);

  // Show modal only during active play; otherwise exit directly
  const triggerExit = () => {
    if (phase === 'question' || phase === 'feedback') {
      setShowExitModal(true);
    } else {
      onBack();
    }
  };
  const [isDaily, setIsDaily] = useState(false);

  // Game state
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [powerUps, setPowerUps] = useState({ freeze: 1, half: 1, extraLife: 1 });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [impactEffect, setImpactEffect] = useState(null); // 'correct' or 'wrong'
  const [countdown, setCountdown] = useState(null);

  const isMounted = useRef(true);
  const feedbackTimeoutRef = useRef(null);
  const timeoutActionRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(feedbackTimeoutRef.current);
      clearTimeout(timeoutActionRef.current);
    };
  }, []);





  // XP & Progression State
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('mindquest_xp') || '0', 10));
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem('mindquest_level') || '1', 10));
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleStart = (catId, subId, diffKey) => {
    console.log(`%c[GAME START] Initializing session: ${catId} > ${subId} (${diffKey})`, 'color: #38bdf8; font-weight: bold');
    
    // Pre-generate and validate questions to prevent "Data Error" mid-game
    const questions = generateQuiz(catId, subId, diffKey);
    
    if (questions.length === 0) {
      console.warn("[GAME START] Aborted: No questions found even after fallback.");
      setPhase('error');
      return;
    }

    setCategory(catId);
    setSubcategory(subId);
    setDifficulty(diffKey);
    setActiveQuestions(questions); // Set questions immediately
    setCurrentIndex(0);
    setScore(0);
    setLives(MAX_LIVES);
    setStreak(0);
    setHighestStreak(0);
    setCountdown(3); // Start cinematic countdown
    setPhase('ready');
  };

  // ── Countdown Timer ──
  useEffect(() => {
    if (phase !== 'ready' || countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 800);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, transition to gameplay
      setSelectedAnswer(null);
      setFeedbackMsg('');
      setHiddenOptions([]);
      setCountdown(null);
      setTimeLeft(DIFFICULTIES[difficulty].time);
      setPhase('question');
    }
  }, [countdown, phase, category, subcategory, difficulty, isDaily]);

  // Mastery Tracking logic
  const getMastery = (catId) => {
    return parseInt(localStorage.getItem(`mindquest_mastery_${catId}`) || '0', 10);
  };

  const updateMastery = (catId, newScore) => {
    const current = getMastery(catId);
    if (newScore > current) {
      localStorage.setItem(`mindquest_mastery_${catId}`, newScore);
    }
  };

  const handleNextRef = useRef(null);

  const isDone = phase === 'end';
  const answered = phase === 'feedback';
  const timerDanger = timeLeft <= 3 && timeLeft > 0;
  const timerStart = (difficulty && DIFFICULTIES[difficulty]) ? DIFFICULTIES[difficulty].time : 10;

  const handleNext = () => {
    const isLast = currentIndex === activeQuestions.length - 1;
    if (isLast) {
      setPhase('end');
      updateMastery(category, score);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTimeLeft(DIFFICULTIES[difficulty].time);
      setHiddenOptions([]);
      setIsTimerPaused(false);
      setPhase('question');
    }
  };
  handleNextRef.current = handleNext;

  // ── Auto-advance to next question from feedback phase ──
  useEffect(() => {
    if (phase === 'feedback') {
      const id = setTimeout(() => handleNextRef.current(), 1000); // 1s feedback
      return () => clearTimeout(id);
    }
  }, [phase]);

  // ── Countdown timer for question phase ──
  useEffect(() => {
    if (phase !== 'question' || isTimerPaused) return;

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          // Auto timeout wrong answer
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [phase, isTimerPaused, currentIndex]);

  const handleTimeout = () => {
    playSound('wrong');
    setImpactEffect('wrong');
    setStreak(0);
    setFeedbackMsg("Time's Up!");
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) {
        timeoutActionRef.current = setTimeout(() => {
          if (!isMounted.current) return;
          playSound('gameOver');
          setPhase('end');
        }, 1500);
      } else {
        setPhase('feedback');
      }
      return next;
    });
    setTimeout(() => {
      if (isMounted.current) setImpactEffect(null);
    }, 1000);
  };

  // ── Danger Ticking Sound ──
  useEffect(() => {
    if (timerDanger && phase === 'question') {
      playSound('tick');
    }
  }, [timeLeft, timerDanger, phase]);

  // ── High Score Persistence ──
  useEffect(() => {
    if (phase === 'end') {
      const saved = localStorage.getItem('mindquest_high_score') || 0;
      if (score > parseInt(saved, 10)) {
        localStorage.setItem('mindquest_high_score', score);
      }
    }
  }, [phase, score]);

  // ── XP & Level Persistence ──
  useEffect(() => {
    localStorage.setItem('mindquest_xp', xp);
    localStorage.setItem('mindquest_level', level);
  }, [xp, level]);

  // ── Level Up Logic ──
  useEffect(() => {
    if (xp >= 100) {
      setXp(prev => prev - 100);
      setLevel(prev => prev + 1);
      setShowLevelUp(true);
      // Auto-hide level up notification after 3s
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [xp]);

  const handleSelect = (index) => {
    if (phase !== 'question') return;
    setSelectedAnswer(index);

    const question = activeQuestions[currentIndex];
    if (index === question.correct) {
      playSound('correct');
      setImpactEffect('correct');

      setScore((s) => s + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setHighestStreak(h => Math.max(h, newStreak));
        return newStreak;
      });
      setXp((prev) => prev + 10);
      setFeedbackMsg(POSITIVE_MSGS[Math.floor(Math.random() * POSITIVE_MSGS.length)]);
      setPhase('feedback');
    } else {
      playSound('wrong');
      setImpactEffect('wrong');
      setStreak(0);
      setFeedbackMsg(NEGATIVE_MSGS[Math.floor(Math.random() * NEGATIVE_MSGS.length)]);
      // Lose a life; trigger game over if this was the last one
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          timeoutActionRef.current = setTimeout(() => {
            if (!isMounted.current) return;
            playSound('gameOver');
            setPhase('end');
          }, 1500);
        } else {
          setPhase('feedback');
        }
        return next;
      });
    }

    setTimeout(() => {
      if (isMounted.current) setImpactEffect(null);
    }, 1000);
  };


  // ── Power-up Handlers ──
  const handleFreeze = () => {
    if (powerUps.freeze > 0 && !isTimerPaused && phase === 'question') {
      setIsTimerPaused(true);
      setPowerUps(prev => ({ ...prev, freeze: prev.freeze - 1 }));
      setTimeout(() => setIsTimerPaused(false), 3000);
    }
  };

  const handle5050 = () => {
    if (powerUps.half > 0 && phase === 'question' && hiddenOptions.length === 0) {
      const q = activeQuestions[currentIndex];
      const incorrectIndices = q.options
        .map((_, i) => i)
        .filter(i => i !== q.correct);

      const toHide = shuffleArray(incorrectIndices).slice(0, 2);
      setHiddenOptions(toHide);
      setPowerUps(prev => ({ ...prev, half: prev.half - 1 }));
    }
  };

  const handleExtraLife = () => {
    if (powerUps.extraLife > 0 && phase !== 'end') {
      setLives(prev => prev + 1);
      setPowerUps(prev => ({ ...prev, extraLife: prev.extraLife - 1 }));
    }
  };

  const playAgain = () => {
    setDifficulty(null);
    setCategory(null);
    setPhase('category_select');
  };

  const currentCategoryData = CATEGORY_INFO.find(c => c.id === category);


  /* ── Category Selection Screen ── */
  if (phase === 'category_select') {
    const displayCategories = CATEGORY_INFO;
    const selCat = CATEGORY_INFO.find(c => c.id === selectedCategory);
    return (
      <div className="quiz-result quiz-cat-page">
        <div className="quiz-cat-header">
          <h2 className="quiz-cat-page-title">Select Category</h2>
          <p className="quiz-cat-page-sub">Choose your battlefield of knowledge</p>
        </div>
        <div className={`quiz-category-grid ${displayCategories.length === 1 ? 'quiz-category-grid--single' : ''}`}>
          {displayCategories.map((cat, index) => (
            <div
              key={cat.id}
              className={`quiz-category-card${selectedCategory === cat.id ? ' quiz-cat-selected' : ''}`}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              style={{
                '--card-color': cat.color,
                '--card-color-faint': `${cat.color}20`,
                background: selectedCategory === cat.id
                  ? `linear-gradient(145deg, ${cat.color}25 0%, ${cat.color}08 100%)`
                  : `linear-gradient(180deg, ${cat.color}10 0%, rgba(255,255,255,0.02) 100%)`,
                animationDelay: `${0.05 + (index * 0.07)}s`
              }}
            >
              {/* Glow layer */}
              <div className="quiz-cat-glow-layer" />
              <div className="quiz-category-icon" style={{ textShadow: `0 0 20px ${cat.color}` }}>{cat.icon}</div>
              <h3 className="quiz-category-title">{cat.id}</h3>
              <p className="quiz-category-desc">{cat.desc}</p>
              {selectedCategory === cat.id && (
                <div className="quiz-cat-selected-badge">✓ Selected</div>
              )}
            </div>
          ))}
        </div>

        {/* CTA — only when a category is picked */}
        <div className={`quiz-cat-cta-wrap${selectedCategory ? ' quiz-cat-cta-wrap--visible' : ''}`}>
          <button
            className="quiz-cat-cta-btn"
            style={{ '--cta-color': selCat?.color || '#a855f7' }}
            onClick={() => {
              if (!selectedCategory) return;
              setCategory(selectedCategory);
              setPhase('topic_select');
            }}
          >
            <span>Start {selectedCategory} Challenge</span>
            <span className="quiz-cat-cta-rocket">🚀</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px' }}>
          <button className="back-btn" onClick={onBack}>← Main Menu</button>
        </div>
      </div>
    );
  }

  /* ── Error Screen ── */
  if (phase === 'error') {
    return (
      <div className="quiz-result">
        <div className="quiz-result-icon" style={{ fontSize: '5rem', marginBottom: '16px' }}>⚠️</div>
        <h2 className="quiz-result-title">Data Anomaly Detected</h2>
        <p className="quiz-result-score">We couldn't retrieve enough questions for this protocol.</p>
        <div className="quiz-result-actions">
          <button className="back-btn" onClick={() => setPhase('category_select')}>Change Category</button>
          <button className="play-btn" onClick={() => setPhase('category_select')}>Retry Selection</button>
        </div>
      </div>
    );
  }

  /* ── Topic + Difficulty Selection Screen ── */
  if (phase === 'topic_select') {
    const subcats = currentCategoryData?.subcategories || [];
    return (
      <div className="quiz-result" style={{ width: '100%', maxWidth: '900px' }}>
        <h2 className="quiz-result-title hero-title" style={{ marginBottom: '8px', fontSize: '2.5rem', color: currentCategoryData.color }}>{category} Hub</h2>
        <p className="quiz-result-score" style={{ marginBottom: '24px', color: '#cbd5e1' }}>
          Select a Topic and Difficulty
        </p>

        <div className="difficulty-group">
          {Object.entries(DIFFICULTIES).map(([diffKey, diffData]) => (
            <button
              key={diffKey}
              className={`difficulty-btn ${selectedDifficulty === diffKey ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(diffKey)}
            >
              {diffData.label}
            </button>
          ))}
        </div>

        <div className={`quiz-category-grid ${subcats.length === 1 ? 'quiz-category-grid--single' : ''}`} style={{ gridTemplateColumns: subcats.length === 1 ? undefined : 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {subcats.map((sub, index) => (
            <div
              key={sub.id}
              className="quiz-category-card"
              style={{
                '--card-color': currentCategoryData.color,
                background: `linear-gradient(180deg, ${currentCategoryData.color}15 0%, rgba(255,255,255,0.02) 100%)`,
                animationDelay: `${0.1 + (index * 0.1)}s`,
                cursor: 'default'
              }}
            >
              <div className="quiz-category-icon" style={{ textShadow: `0 0 20px ${currentCategoryData.color}` }}>{sub.icon}</div>
              <h3 className="quiz-category-title">{sub.id}</h3>
              <p className="quiz-category-desc">{sub.desc}</p>
              
              <button 
                className="subcategory-play-btn"
                onClick={() => handleStart(category, sub.id, selectedDifficulty)}
              >
                <span>Start Mission</span>
                <span>🚀</span>
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
          <button className="back-btn" onClick={() => setPhase('category_select')}>← Categories</button>
        </div>
      </div>
    );
  }

  /* ── Get Ready Screen ── */
  if (phase === 'ready') {
    return (
      <div className="ready-container">
        <div style={{ animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <h1 className="ready-title" style={{ color: currentCategoryData.color, textShadow: `0 0 30px ${currentCategoryData.color}` }}>
            {countdown > 0 ? countdown : 'GO!'}
          </h1>
          <p className="ready-subtitle">
            Get Ready... Protocol Initialized
          </p>
        </div>
      </div>
    );
  }

  const getResultFeedback = (finalScore, accuracy) => {
    let icon = '😅';
    if (accuracy >= 80) icon = '🔥';
    else if (accuracy >= 50) icon = '🧠';

    if (accuracy < 30) return { icon, title: 'Knowledge Rookie', message: 'Keep practicing to improve your knowledge!' };
    if (accuracy < 70) return { icon, title: 'Thinking Learner', message: 'Great effort! You are getting there.' };
    if (accuracy < 100) return { icon, title: 'Sharp Mind', message: 'Almost perfect! Just a bit more!' };
    return { icon, title: 'Mind Master', message: 'Flawless victory! You truly are a master!' };
  };

  /* ── End Screen ── */
  if (phase === 'end') {
    const accuracy = activeQuestions.length > 0 ? Math.round((score / activeQuestions.length) * 100) : 0;
    const feedback = getResultFeedback(score, accuracy);

    return (
      <div className="quiz-result" style={{ animation: 'slideUpFadeIn 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards' }}>
        <div className="quiz-result-icon" style={{ fontSize: '5rem', marginBottom: '8px', filter: 'drop-shadow(0 10px 20px rgba(255,255,255,0.15))' }}>
          {feedback.icon}
        </div>

        <h2 className="quiz-result-title" style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
          {feedback.title}
        </h2>

        <div style={{ margin: '16px 0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Final Score</span>
          <p className="quiz-result-score" style={{
            fontSize: '4.5rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #fff 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0',
            lineHeight: '1',
            filter: 'drop-shadow(0 4px 15px rgba(168, 85, 247, 0.3))'
          }}>
            {score} <span style={{ fontSize: '2rem', opacity: '0.5' }}>/ {activeQuestions.length}</span>
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>ACCURACY</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4ade80' }}>{accuracy}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>BEST STREAK</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#facc15' }}>🔥 {highestStreak}</div>
            </div>
          </div>
        </div>

        <p className="quiz-result-desc" style={{ color: '#cbd5e1', fontSize: '1.05rem', marginBottom: '32px', maxWidth: '400px', lineHeight: '1.5' }}>
          {feedback.message} {lives <= 0 && "You ran out of lives!"}
        </p>

        <div style={{ marginBottom: '24px' }}><Hearts lives={lives} /></div>

        <div className="quiz-result-actions" style={{ flexWrap: 'wrap' }}>
          <button className="play-btn" onClick={playAgain}>Play Again</button>

          <button
            className="play-btn"
            onClick={() => {
              const msg = `I scored ${score}/${activeQuestions.length} (${accuracy}%) in MindQuest 🔥 Can you beat my record? 🕹️`;
              navigator.clipboard.writeText(msg);
              alert('✅ Copied to clipboard!');
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)' }}
          >
            📢 Share Score
          </button>

          <button className="back-btn" onClick={onBack}>← Main Menu</button>
        </div>
      </div>
    );
  }

  /* ── Question / Feedback Screen ── */
  const question = activeQuestions[currentIndex];

  if (!question || activeQuestions.length === 0) {
    return (
      <div className="quiz-result">
        <div className="quiz-result-icon">⚠️</div>
        <h2 className="quiz-result-title">Data Error</h2>
        <button className="back-btn" onClick={onBack}>← Back to Menu</button>
      </div>
    );
  }

  return (
    <div className={`quiz-wrapper ${timerDanger && timeLeft > 0 ? 'danger-mode' : ''} ${isTimerPaused ? 'freeze-active' : ''} ${impactEffect === 'correct' ? 'quiz-correct-glow' : ''} ${impactEffect === 'wrong' ? 'quiz-shake' : ''}`}>

      {/* Header */}
      <div className="quiz-header">
        <span className="quiz-progress">
          Q {currentIndex + 1} / {activeQuestions.length}
        </span>
        <span className={`quiz-timer ${timerDanger ? 'quiz-timer--danger' : ''}`}>
          ⏱ {timeLeft}s
        </span>
        <Hearts lives={lives} />
        <span className="quiz-score">Score: {score}</span>
        <div className="quiz-level-badge">
          <span className="lvl-text">LVL</span>
          <span className="lvl-num">{level}</span>
        </div>
      </div>

      {streak >= 2 && (
        <div key={streak} className="quiz-streak-display">
          🔥 Streak: {streak}
        </div>
      )}

      {/* Timer bar */}
      <div className="quiz-timer-bar">
        <div
          className={`quiz-timer-bar__fill ${timerDanger ? 'quiz-timer-bar__fill--danger' : ''}`}
          style={{ width: `${(timeLeft / timerStart) * 100}%` }}
        />
      </div>

      {/* Progress bar */}
      <div className="quiz-bar" style={{ marginTop: 6, marginBottom: 0 }}>
        <div
          className="quiz-bar__fill"
          style={{ width: `${(currentIndex / activeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Power-ups */}
      <div className="quiz-powerups">
        <div
          className={`powerup-card powerup--freeze ${powerUps.freeze === 0 || phase !== 'question' ? 'powerup--used' : ''}`}
          onClick={handleFreeze}
          title="Freeze: Pause timer for 3 seconds"
        >
          <div className="powerup-icon">❄️</div>
          <div className="powerup-info">
            <span className="powerup-label">Pause Timer</span>
            <span className="powerup-status">{powerUps.freeze > 0 ? `${powerUps.freeze} left` : 'Used'}</span>
          </div>
        </div>

        <div
          className={`powerup-card powerup--5050 ${powerUps.half === 0 || hiddenOptions.length > 0 || phase !== 'question' ? 'powerup--used' : ''}`}
          onClick={handle5050}
          title="50-50: Remove 2 incorrect options"
        >
          <div className="powerup-icon">✂️</div>
          <div className="powerup-info">
            <span className="powerup-label">Remove 2</span>
            <span className="powerup-status">{powerUps.half > 0 ? `${powerUps.half} left` : 'Used'}</span>
          </div>
        </div>

        <div
          className={`powerup-card powerup--life ${powerUps.extraLife === 0 || phase === 'end' ? 'powerup--used' : ''}`}
          onClick={handleExtraLife}
          title="Extra Life: Get an extra chance"
        >
          <div className="powerup-icon">❤️</div>
          <div className="powerup-info">
            <span className="powerup-label">Extra Chance</span>
            <span className="powerup-status">{powerUps.extraLife > 0 ? `${powerUps.extraLife} left` : 'Used'}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="fade-transition" key={`q-${currentIndex}`}>
        <p className="quiz-question">{question.question}</p>

        {/* Options */}
        <div className="quiz-options">
          {question.options.map((option, i) => {
            const TILE_COLORS = ['quiz-option--a', 'quiz-option--b', 'quiz-option--c', 'quiz-option--d'];
            let cls = `quiz-option ${TILE_COLORS[i] || ''}`;
            if (phase === 'feedback') {
              if (i === question.correct) cls += ' quiz-option--correct';
              else if (i === selectedAnswer) cls += ' quiz-option--wrong';
            }
            if (i === selectedAnswer && phase === 'question') cls += ' quiz-option--selected';
            if (hiddenOptions.includes(i)) return null;

            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={phase !== 'question'}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="quiz-option-text">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Row — visual only, no text answer spoiler */}
      <div
        className="quiz-feedback-row"
        style={{
          justifyContent: 'center',
          opacity: phase === 'feedback' ? 1 : 0,
          visibility: phase === 'feedback' ? 'visible' : 'hidden',
          height: phase === 'feedback' ? 'auto' : '0',
          overflow: 'hidden',
          marginBottom: phase === 'feedback' ? undefined : 0,
          pointerEvents: 'none'
        }}
      >
        <span className={`quiz-feedback ${selectedAnswer === question.correct ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'}`}>
          {selectedAnswer === question.correct
            ? `✓ ${feedbackMsg}`
            : `✗ ${feedbackMsg}`}
        </span>
      </div>

      <div
        className="quiz-action-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          marginTop: '12px',
          width: '100%'
        }}
      >
        {/* Abandon Game */}
        <button
          className="back-btn quiz-back"
          onClick={triggerExit}
          style={{ width: '100%', maxWidth: '200px', marginTop: '0' }}
        >
          ← Quit Game
        </button>
      </div>

      {/* Level Up Splash Overlay */}
      {showLevelUp && (
        <div className="levelup-overlay">
          <div className="levelup-content">
            <div className="levelup-stars">✨⭐✨</div>
            <h2 className="levelup-title">LEVEL UP!</h2>
            <div className="levelup-new">You reached Level {level}</div>
            <p className="levelup-reward">+ New Rank Unlocked</p>
          </div>
        </div>
      )}
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={onBack}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}

export default QuizGame;
