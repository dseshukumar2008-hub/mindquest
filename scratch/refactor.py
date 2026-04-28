import re
import os

filepath = r"e:\mind quest\src\components\QuizGame.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State changes
state_old = """  const [category, setCategory] = useState(null);
  const [pendingCategory, setPendingCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [pendingSubcategory, setPendingSubcategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [pendingDifficulty, setPendingDifficulty] = useState(null);
  const [isDaily, setIsDaily] = useState(false);

  // const [category, setCategory]=useState(null);
  // const [pendingCategory, setPendingCategory]= useState(null);
  // const [subcategory, setSubcategory]= useState(null);
  // const [pendingSubcategory, setPendingSubcategory]= useState(null);
  // const [difficulty, setDifficulty]= useState(null)
  // const [pendingDifficulty, setPendingDifficulty]= useState(null)
  // const [isDaily, setIsDaily]= useState(false);



  // Game state
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [lives, setLives] = useState(MAX_LIVES);
  const [finished, setFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [powerUps, setPowerUps] = useState({ freeze: 1, half: 1, extraLife: 1 });
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [impactEffect, setImpactEffect] = useState(null); // 'correct' or 'wrong'
  const [countdown, setCountdown] = useState(null);

  // const [activeQuestions, setActiveQuestions]= useState([]);
  // const [currentIndex, setCurrentIndex]= useState(0);
  // const [selectedAnswer, setSelectedAnswer]= useState(null);
  // const [score, setScore]= useState(0);
  // const [streak, setStreak]= useState(0);
  // const [feedbackMsg, setFeedbackMsg]= useState('');
  // const [lives, setLives]= useState(MAX_LIVES);
  // const [finished, setFinished]= useState(false);
  // const [gameOver, setGameOver]= useState(false);
  // const [timeLeft, setTimeLeft]= useState(0);
  // const [isTimerPaused, setIsTimerPaused]= useState(false);
  // const [powerUps, setPowerUps]= useState({ freeze: 1, half: 1, extraLife: 1 });
  // const [hiddenOptions, setHiddenOptions]= useState([]);
  // const [impactEffect, setImpactEffect]= useState(null);
  // const [countdown, setCountdown]= useState(null);"""

state_new = """  const [phase, setPhase] = useState('category_select'); // category_select, topic_select, ready, question, feedback, end
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
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
  const [countdown, setCountdown] = useState(null);"""
content = content.replace(state_old, state_new)

# 2. handleStart and timers
timers_old = """  const handleStart = (diffKey) => {
    console.log(`[STARTING GAME] Cat: ${category}, Sub: ${subcategory}, Diff: ${diffKey}`);
    setDifficulty(diffKey);
    setCountdown(3); // Start cinematic countdown
  };

  // ── Countdown Timer ──
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 800);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, initialize game
      const daySeed = isDaily ? new Date().toDateString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) : null;
      setActiveQuestions(generateQuiz(category, subcategory, difficulty, daySeed));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setStreak(0);
      setFeedbackMsg('');
      setLives(MAX_LIVES);
      setHiddenOptions([]);
      setCountdown(null); // Reset countdown state
    }
  }, [countdown, category, subcategory, difficulty, isDaily]);

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

  const isDone = finished || gameOver;
  const answered = selectedAnswer !== null;
  const timerDanger = timeLeft <= 3;
  const timerStart = (difficulty && DIFFICULTIES[difficulty]) ? DIFFICULTIES[difficulty].time : 10;

  const handleNext = () => {
    if (!answered) setStreak(0);
    const isLast = currentIndex === activeQuestions.length - 1;
    if (isLast) {
      setTimeout(() => setFinished(true), 1500);
      updateMastery(category, score);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTimeLeft(DIFFICULTIES[difficulty].time);
      setHiddenOptions([]);
      setIsTimerPaused(false);
    }
  };
  handleNextRef.current = handleNext;

  // ── Countdown timer (pauses once answered / game over) ──
  useEffect(() => {
    if (answered || isDone || !difficulty || isTimerPaused) return;

    const id = setInterval(() => {
      if (isTimerPaused) return; // double guard
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleNextRef.current();
          return DIFFICULTIES[difficulty] ? DIFFICULTIES[difficulty].time : 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [currentIndex, answered, isDone, difficulty, isTimerPaused]);

  // ── Danger Ticking Sound ──
  useEffect(() => {
    if (timerDanger && timeLeft > 0 && !isDone && !answered) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';

        // High frequency dropping sharply mimics a digital "tick"
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        // Volume spike and fade 
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) { }
    }
  }, [timeLeft, timerDanger, isDone, answered]);

  // ── Auto-advance 1.5 s after selecting an answer ──
  useEffect(() => {
    if (selectedAnswer === null || isDone) return;
    const id = setTimeout(() => handleNextRef.current(), 1500);
    return () => clearTimeout(id);
  }, [selectedAnswer, isDone]);"""

timers_new = """  const handleStart = (catId, subId, diffKey) => {
    console.log(`[STARTING GAME] Cat: ${catId}, Sub: ${subId}, Diff: ${diffKey}`);
    setCategory(catId);
    setSubcategory(subId);
    setDifficulty(diffKey);
    setPhase('ready');
    setCountdown(3); // Start cinematic countdown
  };

  // ── Countdown Timer ──
  useEffect(() => {
    if (phase !== 'ready' || countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 800);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, initialize game
      const daySeed = isDaily ? new Date().toDateString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) : null;
      setActiveQuestions(generateQuiz(category, subcategory, difficulty, daySeed));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setStreak(0);
      setHighestStreak(0);
      setFeedbackMsg('');
      setLives(MAX_LIVES);
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
        setTimeout(() => {
          playSound('gameOver');
          setPhase('end');
        }, 1500);
      } else {
        setPhase('feedback');
      }
      return next;
    });
    setTimeout(() => setImpactEffect(null), 1000);
  };

  // ── Danger Ticking Sound ──
  useEffect(() => {
    if (timerDanger && phase === 'question') {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';

        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) { }
    }
  }, [timeLeft, timerDanger, phase]);"""
content = content.replace(timers_old, timers_new)

# 3. High Score Persistence
persistence_old = """  // ── High Score Persistence ──
  useEffect(() => {
    if (finished || gameOver) {
      const saved = localStorage.getItem('mindquest_high_score') || 0;
      if (score > parseInt(saved, 10)) {
        localStorage.setItem('mindquest_high_score', score);
      }
    }
  }, [finished, gameOver, score]);"""

persistence_new = """  // ── High Score Persistence ──
  useEffect(() => {
    if (phase === 'end') {
      const saved = localStorage.getItem('mindquest_high_score') || 0;
      if (score > parseInt(saved, 10)) {
        localStorage.setItem('mindquest_high_score', score);
      }
    }
  }, [phase, score]);"""
content = content.replace(persistence_old, persistence_new)


# 4. handleSelect
select_old = """  const handleSelect = (index) => {
    if (answered) return;
    setSelectedAnswer(index);

    const question = activeQuestions[currentIndex];
    if (index === question.correct) {
      playSound('correct');
      setImpactEffect('correct');

      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setXp((prev) => prev + 10);
      setFeedbackMsg(multiplier > 1 ? `Double Points! ${POSITIVE_MSGS[Math.floor(Math.random() * POSITIVE_MSGS.length)]}` : POSITIVE_MSGS[Math.floor(Math.random() * POSITIVE_MSGS.length)]);
    } else {
      playSound('wrong');
      setImpactEffect('wrong');
      setStreak(0);
      setFeedbackMsg(NEGATIVE_MSGS[Math.floor(Math.random() * NEGATIVE_MSGS.length)]);
      // Lose a life; trigger game over if this was the last one
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setTimeout(() => {
            playSound('gameOver');
            setGameOver(true);
          }, 1500);
        }
        return next;
      });
    }

    // Clear impact effect after animation
    setTimeout(() => setImpactEffect(null), 1000);
  };"""

select_new = """  const handleSelect = (index) => {
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
          setTimeout(() => {
            playSound('gameOver');
            setPhase('end');
          }, 1500);
        } else {
          setPhase('feedback');
        }
        return next;
      });
    }

    setTimeout(() => setImpactEffect(null), 1000);
  };"""
content = content.replace(select_old, select_new)

powerup_old = """  const handleFreeze = () => {
    if (powerUps.freeze > 0 && !isTimerPaused && !answered && !isDone) {
      setIsTimerPaused(true);
      setPowerUps(prev => ({ ...prev, freeze: prev.freeze - 1 }));
      setTimeout(() => setIsTimerPaused(false), 3000);
    }
  };

  const handle5050 = () => {
    if (powerUps.half > 0 && !answered && !isDone && hiddenOptions.length === 0) {
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
    if (powerUps.extraLife > 0 && !isDone) {
      setLives(prev => prev + 1);
      setPowerUps(prev => ({ ...prev, extraLife: prev.extraLife - 1 }));
    }
  };

  const playAgain = () => {
    setDifficulty(null);
    setPendingDifficulty(null);
    setCategory(null);
    setPendingCategory(null);
  };"""

powerup_new = """  const handleFreeze = () => {
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
  };"""

content = content.replace(powerup_old, powerup_new)


# 5. JSX Returns
screens_old = content[content.find("  /* ── Category Selection Screen ── */"):]

new_screens = """  /* ── Category Selection Screen ── */
  if (phase === 'category_select') {
    const displayCategories = CATEGORY_INFO;
    return (
      <div className="quiz-result">
        <h2 className="quiz-result-title hero-title" style={{ marginBottom: '8px', fontSize: '2.5rem' }}>Select Category</h2>
        <p className="quiz-result-score" style={{ marginBottom: '24px', color: '#cbd5e1' }}>
          Choose your battlefield of knowledge
        </p>
        <div className="quiz-category-grid">
          {displayCategories.map((cat, index) => (
            <div
              key={cat.id}
              className="quiz-category-card"
              onClick={() => {
                setCategory(cat.id);
                setPhase('topic_select');
              }}
              style={{
                '--card-color': cat.color,
                background: `linear-gradient(180deg, ${cat.color}15 0%, rgba(255,255,255,0.02) 100%)`,
                animationDelay: `${0.1 + (index * 0.1)}s`
              }}
            >
              <div className="quiz-category-icon" style={{ textShadow: `0 0 20px ${cat.color}` }}>{cat.icon}</div>
              <h3 className="quiz-category-title">{cat.id}</h3>
              <p className="quiz-category-desc">{cat.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
          <button className="back-btn" onClick={onBack}>← Main Menu</button>
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

        <div className="quiz-category-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
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
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', width: '100%' }}>
                {Object.entries(DIFFICULTIES).map(([diffKey, diffData]) => (
                  <button
                    key={diffKey}
                    className={`mini-diff-btn mini-diff-${diffKey}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStart(category, sub.id, diffKey);
                    }}
                    title={diffData.desc}
                  >
                    {diffData.label}
                  </button>
                ))}
              </div>
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
      <div className="quiz-result" style={{ height: '60vh', justifyContent: 'center' }}>
        <div style={{ animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <h1 style={{ fontSize: '8rem', fontWeight: '900', color: currentCategoryData.color, textShadow: `0 0 30px ${currentCategoryData.color}` }}>
            {countdown > 0 ? countdown : 'GO!'}
          </h1>
          <p className="quiz-result-score" style={{ fontSize: '1.5rem', marginTop: '-20px' }}>
            Get Ready... Level 1 Begins
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
            let cls = 'quiz-option';
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
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Row */}
      <div className="quiz-feedback-row" style={{ justifyContent: 'center', opacity: phase === 'feedback' ? 1 : 0, pointerEvents: 'none' }}>
          <span className={`quiz-feedback ${selectedAnswer === question.correct ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'}`}>
            {selectedAnswer === question.correct
              ? `✓ ${feedbackMsg}`
              : `✗ ${feedbackMsg} Answer: "${question.options[question.correct]}"`}
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
          onClick={onBack}
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
    </div>
  );
}

export default QuizGame;
"""

content = content[:content.find("  /* ── Category Selection Screen ── */")] + new_screens

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
