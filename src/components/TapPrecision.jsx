import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TapPrecision.css';
import { playSound } from '../utils/audio';
import ExitConfirmModal from './ExitConfirmModal';

const MAX_ROUNDS = 10;
const INITIAL_LIVES = 3;
const TARGET_SIZE = 80;
const START_SIZE = 300;
const PERFECT_THRESHOLD = 6;
const GOOD_THRESHOLD = 24;

const TapPrecision = ({ onBack }) => {
  const [phase, setPhase] = useState('start');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [bestStreak, setBestStreak] = useState(0);

  // Dynamic scroll lock based on phase
  useEffect(() => {
    if (phase === 'gameover' || phase === 'playing') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [phase]);

  // Game Object States
  const [currentSize, setCurrentSize] = useState(START_SIZE);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // % of area
  const [traps, setTraps] = useState([]); // [{id, x, y, size}]

  const [feedback, setFeedback] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const requestRef = useRef();
  const startTimeRef = useRef();
  const gameActiveRef = useRef(false);
  const isMounted = useRef(true);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cancelAnimationFrame(requestRef.current);
      clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const getSpeed = (r) => Math.max(800, 2200 - (r * 150));
  const getTolerance = (r) => Math.max(2, PERFECT_THRESHOLD - Math.floor(r / 3));

  const startGame = () => {
    setPhase('playing');
    setRound(1);
    setScore(0);
    setLives(INITIAL_LIVES);
    setStreak(0);
    setMultiplier(1);
    setBestStreak(0);
    generateRound(1);
  };

  const generateRound = (r) => {
    setCurrentSize(START_SIZE);
    setFeedback(null);

    // R7-8: Random start position for moving target
    if (r >= 7 && r <= 8) {
      setPosition({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });
    } else {
      setPosition({ x: 50, y: 50 });
    }

    // R9-10: Generate traps
    if (r >= 9) {
      const newTraps = [
        { id: 1, x: 25 + Math.random() * 15, y: 30 + Math.random() * 40 },
        { id: 2, x: 60 + Math.random() * 15, y: 30 + Math.random() * 40 }
      ];
      setTraps(newTraps);
      setPosition({ x: 40 + Math.random() * 20, y: 40 + Math.random() * 20 });
    } else {
      setTraps([]);
    }

    gameActiveRef.current = true;
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = (time) => {
    if (!gameActiveRef.current || isPaused || isExiting) {
      startTimeRef.current = time - (performance.now() - startTimeRef.current);
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const speed = getSpeed(round);
    const elapsed = time - startTimeRef.current;
    const progress = Math.min(1.2, elapsed / speed);

    const newSize = START_SIZE - (START_SIZE - TARGET_SIZE) * progress;
    setCurrentSize(newSize);

    // R7-8: Drift the position
    if (round >= 7 && round <= 8) {
      setPosition(prev => ({
        x: prev.x + Math.sin(time / 500) * 0.2,
        y: prev.y + Math.cos(time / 500) * 0.1
      }));
    }

    if (newSize < TARGET_SIZE - GOOD_THRESHOLD * 1.5) {
      handleTap(null, true);
      return;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  const handleTap = (e, isAutoMiss = false) => {
    if (!gameActiveRef.current || phase !== 'playing') return;

    // R9-10: If user clicked a trap, miss
    if (e && e.target.classList.contains('tp-trap')) {
      processResult('miss');
      return;
    }

    gameActiveRef.current = false;
    cancelAnimationFrame(requestRef.current);

    if (isAutoMiss) {
      processResult('miss');
      return;
    }

    const diff = Math.abs(currentSize - TARGET_SIZE);
    const tolerance = getTolerance(round);

    if (diff <= tolerance) {
      playSound('perfect');
      processResult('perfect', diff);
    } else if (diff <= GOOD_THRESHOLD) {
      playSound('correct');
      processResult('good', diff);
    } else {
      playSound('wrong');
      processResult('miss', diff);
    }
  };

  const processResult = (type, diff = 0) => {
    let points = 0;
    let newMultiplier = multiplier;

    if (type === 'perfect') {
      points = 10 * multiplier;
      newMultiplier = Math.min(5, multiplier + 0.5);
      setStreak(prev => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else if (type === 'good') {
      points = 5;
      newMultiplier = 1;
      setStreak(0);
    } else {
      setLives(prev => prev - 1);
      newMultiplier = 1;
      setStreak(0);
    }

    setScore(prev => prev + points);
    setMultiplier(newMultiplier);
    setFeedback({ type, offset: diff });
    setPhase('feedback');

    transitionTimeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      if (lives - (type === 'miss' ? 1 : 0) <= 0 || round >= MAX_ROUNDS) {
        setPhase('gameover');
      } else {
        setPhase('playing');
        setRound(prev => prev + 1);
        generateRound(round + 1);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const TopBar = () => (
    <div className="tp-top-bar">
      <div className="tp-hud-item tp-hud-round">
        <span className="tp-label">PROGRESS</span>
        <div className="tp-round-dots">
          {[...Array(MAX_ROUNDS)].map((_, i) => (
            <div key={i} className={`tp-dot ${i < round ? 'tp-dot--done' : ''} ${i === round - 1 ? 'tp-dot--active' : ''}`} />
          ))}
        </div>
      </div>
      <div className="tp-hud-item tp-hud-score">
        <span className="tp-label">SCORE</span>
        <div className="tp-score-wrapper">
          <span className="tp-value">{score}</span>
          {multiplier > 1 && <span className="tp-multiplier">x{multiplier.toFixed(1)}</span>}
        </div>
      </div>
      <div className="tp-hud-item tp-hud-lives">
        <div className="tp-lives-row">
          {[...Array(INITIAL_LIVES)].map((_, i) => (
            <span key={i} className={`tp-heart ${i >= lives ? 'tp-heart--lost' : ''}`}>❤️</span>
          ))}
        </div>
      </div>
      <button className="tp-exit-btn" onClick={(e) => { e.stopPropagation(); setIsExiting(true); }}>❌</button>
    </div>
  );

  if (phase === 'start') {
    return (
      <div className="tp-screen tp-screen--start">
        <div className="tp-hero">
          <div className="tp-logo">🎯</div>
          <h1 className="tp-title">Tap Precision <span className="tp-v-tag">v2.0</span></h1>
          <p className="tp-tagline">Evolutionary reflex protocol initiated.</p>
        </div>
        <div className="tp-rules">
          <div className="tp-rule-item"><span>🌀</span> Rounds 4-6: Pulse Distortion</div>
          <div className="tp-rule-item"><span>🚀</span> Rounds 7-8: Mobile Targets</div>
          <div className="tp-rule-item"><span>🎭</span> Rounds 9-10: Decoy Traps</div>
        </div>
        <div className="tp-start-actions">
          <button className="tp-btn tp-btn--primary tp-btn--large" onClick={startGame}>Initialize Mission</button>
          <button className="tp-btn tp-btn--text" onClick={onBack}>Abort to Hub</button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    const accuracy = Math.min(100, Math.round((score / (MAX_ROUNDS * 10)) * 100));
    const isVictory = lives > 0;

    return (
      <div className="tp-screen tp-screen--end">
        <div className="tp-result-wrapper">
          <div className="tp-result-card">
            {/* 🏆 HEADER SECTION */}
            <div className="tp-result-header-top">
              <h3 className="tp-result-status-title">
                {isVictory ? 'MISSION COMPLETE' : 'MISSION FAILED'}
              </h3>
            </div>

            {/* 🎯 MAIN SCORE HERO */}
            <div className="tp-result-score-hero">
              <span className="tp-stat-label-small">FINAL SCORE</span>
              <div className="tp-score-value-large">{score}</div>
            </div>

            {/* 📊 STATS GRID */}
            <div className="tp-result-grid-v2">
              <div className="tp-stat-mini-card">
                <span className="tp-stat-label-small">ACCURACY</span>
                <span className="tp-stat-value-mid">{accuracy}%</span>
              </div>
              <div className="tp-stat-mini-card">
                <span className="tp-stat-label-small">BEST STREAK</span>
                <span className="tp-stat-value-mid">🔥 {bestStreak}</span>
              </div>
            </div>

            {/* 🔘 ACTION BUTTONS */}
            <div className="tp-result-actions-v2">
              <button className="tp-btn tp-btn--primary tp-btn--result" onClick={startGame}>Play Again</button>
              <button className="tp-btn tp-btn--secondary tp-btn--result" onClick={onBack}>Back to Hub</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-screen tp-screen--playing" onClick={(e) => handleTap(e, false)}>
      <TopBar />

      <div className="tp-game-area">
        {/* Traps for R9-10 */}
        {traps.map(t => (
          <div
            key={t.id}
            className="tp-trap"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: TARGET_SIZE,
              height: TARGET_SIZE
            }}
          />
        ))}

        {/* Target Ring */}
        <div className="tp-target-container" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
          <div className="tp-target-ring" style={{ width: TARGET_SIZE, height: TARGET_SIZE }}>
            <div className="tp-perfect-zone" style={{ width: TARGET_SIZE + getTolerance(round), height: TARGET_SIZE + getTolerance(round) }} />
          </div>

          <div
            className={`tp-shrinker ${phase === 'feedback' ? `tp-shrinker--${feedback.type}` : ''} ${round >= 4 && round <= 6 ? 'tp-pulse-anim' : ''}`}
            style={{ width: currentSize, height: currentSize }}
          />
        </div>

        {phase === 'feedback' && (
          <div className={`tp-feedback-toast tp-toast--${feedback.type}`}>
            {feedback.type.toUpperCase()}!
          </div>
        )}
      </div>

      <div className="tp-bottom-bar">
        {streak > 1 && <div className="tp-combo">🔥 COMBO x{streak}</div>}
        <div className="tp-round-label">PROTOCOL STAGE: {round <= 3 ? 'Alpha' : round <= 6 ? 'Beta' : round <= 8 ? 'Gamma' : 'Omega'}</div>
      </div>

      <ExitConfirmModal
        isOpen={isExiting}
        onConfirm={onBack}
        onCancel={() => setIsExiting(false)}
      />
    </div>
  );
};

export default TapPrecision;

