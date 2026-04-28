import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BalanceControl.css';


const TICK_RATE = 16;
const ACCEL_BASE = 0.4;
const DRIFT_BASE = 0.1;
const FRICTION = 0.98;
const GRAVITY_BASE = 0.001;
const MAX_VELOCITY = 2.5;
const MAX_DIFFICULTY = 5.0;

export default function BalanceControl({ onBack }) {
  const [phase, setPhase] = useState('start'); // start | playing | gameover
  const [renderState, setRenderState] = useState({ balance: 0, score: 0, difficulty: 1 });
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('bc_best') || '0', 10));

  const physicsRef = useRef({
    balance: 0,
    velocity: 0,
    score: 0,
    difficulty: 1,
    driftDir: 1,
    lastTick: 0,
    phase: 'start'
  });

  const requestRef = useRef();

  /* ── GAME ENGINE ── */

  const startGame = () => {
    physicsRef.current = {
      balance: 0,
      velocity: 0,
      score: 0,
      difficulty: 1,
      driftDir: Math.random() > 0.5 ? 1 : -1,
      lastTick: performance.now(),
      phase: 'playing'
    };
    setPhase('playing');
    requestRef.current = requestAnimationFrame(gameLoop);

  };

  const applyForce = (dir) => {
    if (physicsRef.current.phase !== 'playing') return;

    // Add a minimum "kick" if moving in the same direction or starting from still
    const currentVel = physicsRef.current.velocity;
    if (Math.abs(currentVel) < 0.2 || (currentVel > 0 && dir > 0) || (currentVel < 0 && dir < 0)) {
      physicsRef.current.velocity += dir * ACCEL_BASE;
    } else {
      // Stronger counter-force
      physicsRef.current.velocity += dir * ACCEL_BASE * 1.5;
    }
  };

  const gameLoop = useCallback((time) => {
    const p = physicsRef.current;
    if (p.phase !== 'playing') return;

    if (!p.lastTick) p.lastTick = time;
    const dt = Math.min(32, time - p.lastTick);
    p.lastTick = time;

    const dtFactor = dt / 16;

    // 1. Drift update
    if (Math.random() > 0.99) p.driftDir *= -1;
    const drift = p.driftDir * DRIFT_BASE * p.difficulty;

    // 2. Gravity pull
    const gravity = p.balance * GRAVITY_BASE * p.difficulty;

    // 3. Physics update
    p.velocity += (drift + gravity) * dtFactor;
    p.velocity *= Math.pow(FRICTION, dtFactor);

    // Speed Cap
    p.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, p.velocity));

    // Update Position
    p.balance += p.velocity * dtFactor;

    // Update Score & Difficulty
    p.score += dt / 1000;
    p.difficulty = Math.min(MAX_DIFFICULTY, 1 + p.score * 0.05);

    // Render Sync
    setRenderState({
      balance: p.balance,
      score: Math.floor(p.score * 60),
      difficulty: p.difficulty
    });

    // Check Fail
    if (Math.abs(p.balance) > 100) {
      p.phase = 'gameover';
      setPhase('gameover');
      return;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, []); // Remove phase dependency to avoid closure issues

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') applyForce(-1);
      if (e.key === 'ArrowRight') applyForce(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(requestRef.current);
    };
  }, [phase, gameLoop]);

  useEffect(() => {
    if (phase === 'gameover' && renderState.score > bestScore) {
      setBestScore(renderState.score);
      localStorage.setItem('bc_best', renderState.score.toString());
    }
  }, [phase, renderState.score, bestScore]);

  /* ── RENDER ── */

  if (phase === 'start') {
    return (
      <div className="bc-screen bc-screen--start">
        <h1 className="bc-title">Balance Control</h1>
        <p className="bc-subtitle">Maintain equilibrium against entropy.</p>

        <div className="bc-start-card">
          <div className="bc-preview">
            <div className="bc-preview-line" />
            <div className="bc-preview-dot" />
          </div>
          <div className="bc-instructions">
            <p>Use <b>Arrow Keys</b> or <b>Buttons</b> to keep the dot centered.</p>
            <p>The further it drifts, the harder it pulls!</p>
          </div>
          <button className="bc-btn bc-btn--primary" onClick={startGame}>Initialize System</button>
          <button className="back-btn" onClick={onBack}>← Back to Hub</button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="bc-screen bc-screen--gameover">
        <div className="bc-go-icon">⚖️</div>
        <h2 className="bc-go-title">Stability Lost</h2>

        <div className="bc-stats">
          <div className="bc-stat">
            <span className="bc-stat-label">Stability Time</span>
            <span className="bc-stat-val">{(renderState.score / 60).toFixed(2)}s</span>
          </div>
          <div className="bc-stat">
            <span className="bc-stat-label">Best Record</span>
            <span className="bc-stat-val">{(bestScore / 60).toFixed(2)}s</span>
          </div>
        </div>

        <div className="bc-actions">
          <button className="bc-btn bc-btn--primary" onClick={startGame}>Try Again</button>
          <button className="back-btn" onClick={onBack}>Return to Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bc-screen bc-screen--game">
      <div className="bc-hud">
        <div className="bc-hud-item">
          <span className="bc-label">STABILITY</span>
          <span className="bc-val">{(renderState.score / 60).toFixed(1)}s</span>
        </div>
        <div className="bc-hud-item">
          <span className="bc-label">INTENSITY</span>
          <span className="bc-val">{(renderState.difficulty * 10).toFixed(1)}x</span>
        </div>
      </div>

      <div className="bc-area">
        <div className="bc-track">
          <div className="bc-center-mark" />
          <div
            className="bc-dot"
            style={{
              left: `calc(50% + ${renderState.balance}%)`,
              backgroundColor: Math.abs(renderState.balance) > 70 ? '#ef4444' : '#38bdf8',
              boxShadow: `0 0 30px ${Math.abs(renderState.balance) > 70 ? '#ef4444' : '#38bdf8'}`
            }}
          />
        </div>
      </div>

      <div className="bc-controls">
        <button className="bc-ctrl-btn" onMouseDown={() => applyForce(-1)} ontouchstart={() => applyForce(-1)}>←</button>
        <button className="bc-ctrl-btn" onMouseDown={() => applyForce(1)} ontouchstart={() => applyForce(1)}>→</button>
      </div>

      <button className="back-btn" onClick={() => setPhase('start')}>Change Mode</button>
    </div>
  );
}
