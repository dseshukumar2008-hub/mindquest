import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSound } from '../utils/audio';
import { IPL_QUESTIONS } from '../data/iplQuestions';

const TOTAL_TIME = 30;
const BASE_SCORE = 10;


function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRank(score) {
  if (score >= 200) return { label: 'Legend', icon: '🏆', color: '#f59e0b', desc: "You're an IPL encyclopedia!" };
  if (score >= 130) return { label: 'Expert', icon: '💪', color: '#f97316', desc: 'Impressive cricket knowledge!' };
  if (score >= 70) return { label: 'Pro', icon: '🔥', color: '#ef4444', desc: 'Well above average!' };
  if (score >= 30) return { label: 'Fan', icon: '⭐', color: '#a855f7', desc: 'Keep watching more IPL!' };
  return { label: 'Beginner', icon: '🏏', color: '#64748b', desc: 'Just getting started. Keep going!' };
}

function getMultiplier(streak) {
  if (streak >= 7) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

const RANK_LADDER = [
  { label: 'Beginner', min: 0, icon: '🏏' },
  { label: 'Fan', min: 30, icon: '⭐' },
  { label: 'Pro', min: 70, icon: '🔥' },
  { label: 'Expert', min: 130, icon: '💪' },
  { label: 'Legend', min: 200, icon: '🏆' },
];

export default function IPLRapidFire({ onBack }) {
  // Build question pool once across ALL IPL years with non-repetition logic
  const allQs = useRef(null);
  if (!allQs.current) {
    let pool = [];
    Object.entries(IPL_QUESTIONS).forEach(([year, qs]) => {
      qs.forEach(q => pool.push({ ...q, year: parseInt(year) }));
    });

    const seenIds = JSON.parse(localStorage.getItem('mq_seen_ipl') || '[]');
    let filteredPool = pool.filter(q => !seenIds.includes(q.question));

    // Reset if pool exhausted
    if (filteredPool.length < 15) {
      localStorage.setItem('mq_seen_ipl', JSON.stringify([]));
      filteredPool = pool;
    }

    allQs.current = shuffleArray(filteredPool);
    
    // Mark these questions as seen
    const newSeen = [...new Set([...seenIds, ...allQs.current.slice(0, 30).map(q => q.question)])];
    localStorage.setItem('mq_seen_ipl', JSON.stringify(newSeen.slice(-1000)));
  }

  const [phase, setPhase] = useState('ready');   // ready | question | reveal | done
  const [readyCt, setReadyCt] = useState(3);
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastPts, setLastPts] = useState(null);
  const [ptsAnim, setPtsAnim] = useState(0);   // increment key to re-trigger float anim
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const currentQ = allQs.current[qIdx % allQs.current.length];
  const mult = getMultiplier(streak);

  /* ── Ready countdown ── */
  useEffect(() => {
    if (phase !== 'ready') return;
    if (readyCt <= 0) { 
      if (isMounted.current) setPhase('question'); 
      return; 
    }
    const t = setTimeout(() => {
      if (isMounted.current) {
        setReadyCt(c => c - 1);
        playSound('tick');
      }
    }, 900);
    return () => clearTimeout(t);
  }, [phase, readyCt]);

  /* ── Game timer (ticks in question + reveal phases) ── */
  useEffect(() => {
    if (phase !== 'question' && phase !== 'reveal') return;
    if (timeLeft <= 0) { 
      if (isMounted.current) {
        setPhase('done');
        playSound('gameOver');
      }
      return; 
    }
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { 
          if (isMounted.current) {
            setPhase('done');
            playSound('gameOver');
          }
          return 0; 
        }
        return s - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [phase]);   // intentionally omit timeLeft to avoid re-registering

  /* ── Tap card to reveal answer ── */
  const handleReveal = useCallback(() => {
    if (phase !== 'question') return;
    setPhase('reveal');
  }, [phase]);

  /* ── User self-reports got it / missed ── */
  const handleAnswer = useCallback((gotIt) => {
    if (phase !== 'reveal') return;
    setTotal(t => t + 1);

    if (gotIt) {
      playSound('correct');
      const newStreak = streak + 1;
      const m = getMultiplier(newStreak);
      const pts = Math.round(BASE_SCORE * m);
      setStreak(newStreak);
      setMaxStreak(ms => Math.max(ms, newStreak));
      setScore(s => s + pts);
      setCorrect(c => c + 1);
      setLastPts(pts);
      setPtsAnim(k => k + 1);
    } else {
      playSound('wrong');
      setStreak(0);
      setLastPts(null);
    }

    setQIdx(i => i + 1);
    setPhase('question');
  }, [phase, streak]);

  /* ── Restart ── */
  const restart = () => {
    allQs.current = shuffleArray(allQs.current);
    setPhase('ready');
    setReadyCt(3);
    setQIdx(0);
    setTimeLeft(TOTAL_TIME);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrect(0);
    setTotal(0);
    setLastPts(null);
    setPtsAnim(0);
  };

  /* ════════════════════════════
     READY SCREEN
  ════════════════════════════ */
  if (phase === 'ready') {
    return (
      <div className="rf-screen rf-screen--ready">
        <div className="rf-ready-glow" />
        <div className="rf-ready-content">
          <div className="rf-mode-badge">⚡ RAPID FIRE</div>
          <h2 className="rf-ready-title">Get Ready!</h2>
          <div className="rf-ready-count" key={readyCt}>
            {readyCt > 0 ? readyCt : 'GO!'}
          </div>
          <p className="rf-ready-sub">30 seconds · All IPL Seasons · No limits</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════
     DONE / RESULTS SCREEN
  ════════════════════════════ */
  if (phase === 'done') {
    const rank = getRank(score);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="rf-screen rf-screen--done">
        <div className="rf-done-rank-icon">{rank.icon}</div>
        <h2 className="rf-done-rank-label" style={{ color: rank.color }}>{rank.label}</h2>
        <p className="rf-done-rank-desc">{rank.desc}</p>

        {/* Stats grid */}
        <div className="rf-stats-grid">
          <div className="rf-stat"><span className="rf-stat-val" style={{ color: '#f97316' }}>{score}</span><span className="rf-stat-label">Score</span></div>
          <div className="rf-stat"><span className="rf-stat-val" style={{ color: '#22c55e' }}>{correct}</span><span className="rf-stat-label">Correct</span></div>
          <div className="rf-stat"><span className="rf-stat-val" style={{ color: '#a855f7' }}>{maxStreak}🔥</span><span className="rf-stat-label">Best Streak</span></div>
          <div className="rf-stat"><span className="rf-stat-val" style={{ color: '#3b82f6' }}>{accuracy}%</span><span className="rf-stat-label">Accuracy</span></div>
        </div>

        {/* Rank ladder */}
        <div className="rf-rank-ladder">
          {RANK_LADDER.map(r => {
            const isCurrent = rank.label === r.label;
            const isPassed = !isCurrent && score >= r.min;
            return (
              <div key={r.label} className={`rf-ladder-step ${isCurrent ? 'rf-ladder-step--current' : ''} ${isPassed ? 'rf-ladder-step--passed' : ''}`}>
                <span className="rf-ladder-icon">{r.icon}</span>
                <span className="rf-ladder-name">{r.label}</span>
                <span className="rf-ladder-score">{r.min}+</span>
              </div>
            );
          })}
        </div>

        {/* Score breakdown */}
        <p className="rf-multiplier-note">
          💡 Earn streak bonuses: 3✓=1.5× · 5✓=2× · 7✓=3×
        </p>

        <div className="rf-done-actions">
          <button className="rf-play-again-btn" onClick={restart}>⚡ Play Again</button>
          <button className="back-btn" onClick={onBack}>← Back</button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════
     GAMEPLAY SCREEN
  ════════════════════════════ */
  const timerPct = (timeLeft / TOTAL_TIME) * 100;
  const timerDanger = timeLeft <= 8;

  return (
    <div className="rf-screen rf-screen--game">

      {/* ── Top bar ── */}
      <div className="rf-topbar">
        <div className="rf-score-box">
          <span className="rf-score-val">{score}</span>
          <span className="rf-score-label">PTS</span>
        </div>

        {/* Circular timer */}
        <div className={`rf-timer-block ${timerDanger ? 'rf-timer-block--danger' : ''}`}>
          <svg viewBox="0 0 56 56" className="rf-timer-svg">
            <circle cx="28" cy="28" r="23" className="rf-ring-bg" />
            <circle
              cx="28" cy="28" r="23"
              className={`rf-ring-fill ${timerDanger ? 'rf-ring-fill--danger' : ''}`}
              strokeDasharray={`${2 * Math.PI * 23}`}
              strokeDashoffset={`${2 * Math.PI * 23 * (1 - timerPct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <span className="rf-timer-num">{timeLeft}</span>
        </div>

        <div className="rf-streak-box">
          {mult > 1 && (
            <span className="rf-mult-badge" key={streak}>{mult}×</span>
          )}
          <span className="rf-streak-val">{streak > 0 ? `🔥 ×${streak}` : '—'}</span>
          <span className="rf-streak-label">STREAK</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="rf-timer-bar">
        <div
          className={`rf-timer-bar-fill ${timerDanger ? 'rf-timer-bar-fill--danger' : ''}`}
          style={{ width: `${timerPct}%`, transition: 'width 0.9s linear' }}
        />
      </div>

      {/* ── Floating +pts popup ── */}
      {ptsAnim > 0 && lastPts && (
        <div className="rf-pts-popup" key={ptsAnim}>+{lastPts}</div>
      )}

      {/* ── Question card ── */}
      <div
        className={`rf-q-card ${phase === 'reveal' ? 'rf-q-card--revealed' : 'rf-q-card--interactive'}`}
        onClick={phase === 'question' ? handleReveal : undefined}
        role={phase === 'question' ? 'button' : undefined}
      >
        <div className="rf-q-year-tag">🏏 IPL {currentQ.year}</div>
        <p className="rf-q-text">{currentQ.question}</p>

        {phase === 'question' && (
          <div className="rf-tap-hint">
            <span className="rf-tap-pulse" />
            Tap anywhere to reveal answer
          </div>
        )}

        {phase === 'reveal' && (
          <div className="rf-answer-reveal">
            <span className="rf-answer-label">✓ Answer</span>
            <span className="rf-answer-text">{currentQ.correctAnswer}</span>
          </div>
        )}
      </div>

      {/* ── Answer buttons ── */}
      {phase === 'reveal' && (
        <div className="rf-answer-row">
          <button className="rf-btn rf-btn--got" onClick={() => handleAnswer(true)}>
            <span className="rf-btn-icon">👊</span>
            <span>GOT IT!</span>
            <span className="rf-btn-pts">+{Math.round(BASE_SCORE * mult)}</span>
          </button>
          <button className="rf-btn rf-btn--miss" onClick={() => handleAnswer(false)}>
            <span className="rf-btn-icon">💀</span>
            <span>MISSED</span>
            <span className="rf-btn-pts">+0</span>
          </button>
        </div>
      )}

      <button className="back-btn" style={{ marginTop: '16px', opacity: 0.45 }} onClick={onBack}>
        ← Exit
      </button>
    </div>
  );
}
