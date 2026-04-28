import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSound } from '../utils/audio';
import './PerfectTiming.css';
import ExitConfirmModal from './ExitConfirmModal';

const MAX_ROUNDS = 10;

const MODES = [
  { id: 'easy', title: 'Easy', desc: 'Target: 10.00s. Visible timer.', icon: '🟢', target: 10 },
  { id: 'medium', title: 'Medium', desc: 'Target: 7.00s. Visible timer.', icon: '🟡', target: 7 },
  { id: 'hard', title: 'Hard', desc: 'Target: Random (5-15s). Visible timer.', icon: '🔴', target: 'random' },
  { id: 'trick', title: 'Trick Mode', desc: 'Target: 10.00s. Timer hides after 2s.', icon: '🥷', target: 10 }
];

export default function PerfectTiming({ onBack }) {
  const [phase, setPhase] = useState('mode-select');
  // 'mode-select' | 'ready' | 'playing' | 'round-result' | 'gameover'

  const [mode, setMode] = useState(null);
  const [round, setRound] = useState(1);
  const [targetTime, setTargetTime] = useState(10);

  // Timer states
  const [timerRunning, setTimerRunning] = useState(false);
  const [timePassed, setTimePassed] = useState(0); // in seconds
  const reqRef = useRef(null);
  const startRef = useRef(0);
  const isMounted = useRef(true);
  const transitionTimeoutRef = useRef(null);


  // History for averages
  const [history, setHistory] = useState([]); // array of { diff, rank }

  const [roundResult, setRoundResult] = useState(null); // { time, diff, rank }
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cancelAnimationFrame(reqRef.current);
      clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  /* ── TIMER ENGINE ── */
  const animate = useCallback((time) => {
    if (!startRef.current) startRef.current = time;
    const elapsedMs = time - startRef.current;
    setTimePassed(elapsedMs / 1000);
    reqRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      startRef.current = performance.now();
      reqRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [timerRunning, animate]);

  /* ── GAME LOGIC ── */
  const startRound = (r, mId) => {
    const selectedMode = MODES.find(m => m.id === mId);
    let target = selectedMode.target;
    if (target === 'random') {
      target = Math.floor(Math.random() * 11) + 5; // 5 to 15
    }

    setMode(mId);
    setRound(r);
    setTargetTime(target);
    setTimePassed(0);
    setTimerRunning(false);
    setPhase('playing');
  };

  const handleStartTimer = () => {
    setTimePassed(0);
    setTimerRunning(true);
    playSound('go');
  };

  const handleStopTimer = () => {
    if (!timerRunning) return;
    setTimerRunning(false);

    // Calculate result
    const diff = Math.abs(targetTime - timePassed);
    const rawDiff = targetTime - timePassed; // positive = early, negative = late

    let rank = 'miss';
    let feedback = '';

    if (diff <= 0.10) {
      rank = 'perfect';
      feedback = 'PERFECT!';
      playSound('perfect');
    } else if (diff <= 0.50) {
      rank = 'close';
      feedback = rawDiff > 0 ? 'TOO EARLY' : 'TOO LATE';
      playSound('correct');
    } else {
      rank = 'miss';
      feedback = rawDiff > 0 ? 'TOO EARLY' : 'TOO LATE';
      playSound('wrong');
    }

    const res = { time: timePassed, diff, rank, feedback };
    setRoundResult(res);
    setHistory(prev => [...prev, res]);
    setPhase('round-result');
  };

  const nextRound = () => {
    if (round >= MAX_ROUNDS) {
      setPhase('gameover');
    } else {
      startRound(round + 1, mode);
    }
  };

  const resetGame = () => {
    setHistory([]);
    setPhase('mode-select');
  };

  /* ── RENDER ── */
  if (phase === 'mode-select') {
    return (
      <div className="pt-screen pt-screen--modes">
        <h2 className="pt-title">Perfect Timing</h2>
        <p className="pt-subtitle">Test your internal clock and focus.</p>

        <div className="pt-mode-grid">
          {MODES.map(m => (
            <button
              key={m.id}
              className="pt-mode-card"
              onClick={() => {
                setHistory([]);
                startRound(1, m.id);
              }}
            >
              <div className="pt-mode-icon">{m.icon}</div>
              <div className="pt-mode-info">
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button className="back-btn" style={{ marginTop: '32px' }} onClick={onBack}>← Back to Hub</button>
      </div>
    );
  }

  if (phase === 'gameover') {
    const avgDiff = history.reduce((acc, curr) => acc + curr.diff, 0) / history.length;
    const bestAttempt = Math.min(...history.map(h => h.diff));
    const perfects = history.filter(h => h.rank === 'perfect').length;

    let finalRank = 'Beginner';
    let rankColor = '#ef4444';
    if (avgDiff <= 0.15) { finalRank = 'Perfect'; rankColor = '#10b981'; }
    else if (avgDiff <= 0.40) { finalRank = 'Pro'; rankColor = '#06b6d4'; }
    else if (avgDiff <= 0.80) { finalRank = 'Good'; rankColor = '#f59e0b'; }

    return (
      <div className="pt-screen pt-screen--game pt-screen--gameover">
        <div className="pt-go-icon">⏱️</div>
        <h2 className="pt-go-title">Protocol Complete</h2>

        <h3 style={{ color: rankColor, fontSize: '1.5rem', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {finalRank}
        </h3>

        <div className="pt-go-stats">
          <div className="pt-go-stat">
            <span className="pt-go-stat-val" style={{ color: '#10b981' }}>{avgDiff.toFixed(3)}s</span>
            <span className="pt-go-stat-label">Avg. Difference</span>
          </div>
          <div className="pt-go-stat">
            <span className="pt-go-stat-val" style={{ color: '#06b6d4' }}>{bestAttempt.toFixed(3)}s</span>
            <span className="pt-go-stat-label">Best Attempt</span>
          </div>
          <div className="pt-go-stat">
            <span className="pt-go-stat-val" style={{ color: '#3b82f6' }}>{perfects}</span>
            <span className="pt-go-stat-label">Perfect Hits</span>
          </div>
        </div>

        <div className="pt-go-actions">
          <button className="pt-start-btn pt-btn-secondary" onClick={resetGame}>Change Mode</button>
          <button className="pt-start-btn pt-btn-primary" onClick={() => { setHistory([]); startRound(1, mode); }}>Play Again</button>
          <button className="back-btn" style={{ marginLeft: '12px' }} onClick={onBack}>Exit</button>
        </div>
      </div>
    );
  }

  // Hide timer logic for Trick Mode
  let isHidden = false;
  if (mode === 'trick' && timePassed >= 2.0 && timerRunning) {
    isHidden = true;
  }

  return (
    <div className="pt-screen pt-screen--game">
      <div className="pt-hud">
        <div className="pt-hud-left">
          <div className="pt-round-badge">Round {round} / {MAX_ROUNDS}</div>
          <div className="pt-round-dots">
            {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
              const res = history[i];
              let dotCls = 'pt-dot';
              if (i === round - 1 && phase === 'playing') dotCls += ' pt-dot--active';
              if (res) dotCls += ` pt-dot--${res.rank}`;
              return <div key={i} className={dotCls} />;
            })}
          </div>
        </div>
        <button className="back-btn" onClick={onBack}>Exit</button>
      </div>

      <div className="pt-main-area">
        {phase === 'playing' && (
          <>
            <div className="pt-target-label">Target Time</div>
            <div className="pt-target-time">{targetTime.toFixed(2)}s</div>

            <div className="pt-timer-display" style={{ opacity: isHidden ? 0 : 1 }}>
              {timePassed.toFixed(2)}s
            </div>

            {!timerRunning ? (
              <button className="pt-action-btn pt-action-btn--start" onClick={handleStartTimer}>START</button>
            ) : (
              <button className="pt-action-btn pt-action-btn--stop" onClick={handleStopTimer}>STOP</button>
            )}

            {!timerRunning && (
              <button
                className="back-btn"
                onClick={resetGame}
              >
                🔄 Change Mode
              </button>
            )}

            {mode === 'trick' && !timerRunning && (
              <p className="pt-instruction" style={{ marginTop: '20px' }}>Timer will fade out at 2.00s.</p>
            )}
          </>
        )}

        {phase === 'round-result' && roundResult && (
          <div className="pt-result-box">
            <div className={`pt-rank pt-rank--${roundResult.rank}`}>
              {roundResult.feedback}
            </div>

            <div className="pt-diff-label">Your Time</div>
            <div className="pt-diff-val" style={{ color: 'white' }}>{roundResult.time.toFixed(3)}s</div>

            <div className="pt-diff-label">Difference</div>
            <div className="pt-diff-val" style={{
              color: roundResult.rank === 'perfect' ? '#10b981' :
                roundResult.rank === 'close' ? '#f59e0b' : '#ef4444'
            }}>
              {roundResult.diff > 0 ? '+' : ''}{roundResult.diff.toFixed(3)}s
            </div>

            <button className="pt-action-btn pt-action-btn--start" style={{ marginTop: '24px', padding: '16px 40px', fontSize: '1.2rem' }} onClick={nextRound}>
              {round === MAX_ROUNDS ? 'View Results' : 'Next Round'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
