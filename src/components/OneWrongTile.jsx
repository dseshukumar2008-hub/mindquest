import React, { useState, useEffect, useRef, useCallback } from 'react';
import './OneWrongTile.css';

const INITIAL_TIME = 15;
const MAX_GRID = 8;

const MESSAGES = [
  "Sharp Eyes! 👁️",
  "Eagle Vision! 🦅",
  "Pixel Hunter! 🎯",
  "Speed Demon! ⚡",
  "Obsessive Detail! 🔍",
  "Focus God! 🔥",
];

export default function OneWrongTile({ onBack }) {
  const [phase, setPhase] = useState('start'); // start | playing | gameover
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [comboMsg, setComboMsg] = useState("");

  const [gridData, setGridData] = useState(null); // { tiles, targetIdx, type, isMoving, isFlash }
  const [wrongPulse, setWrongPulse] = useState(false);
  const [correctIdx, setCorrectIdx] = useState(null);
  const [isTilesHidden, setIsTilesHidden] = useState(false);


  const timerRef = useRef(null);

  /* ── GAME LOGIC ── */

  const generateLevel = useCallback((currLevel) => {
    // Determine grid size
    let size = 3;
    if (currLevel > 4) size = 4;
    if (currLevel > 10) size = 5;
    if (currLevel > 18) size = 6;
    if (currLevel > 28) size = 7;
    if (currLevel > 40) size = 8;

    const totalTiles = size * size;
    const targetIdx = Math.floor(Math.random() * totalTiles);

    // Special Modes
    const isMoving = currLevel > 15 && Math.random() > 0.6;
    const isFlash = currLevel > 22 && Math.random() > 0.7;

    // Pick a difference type: color, brightness, size, rotate
    const types = ['color', 'brightness', 'size', 'rotate'];
    const type = types[Math.floor(Math.random() * types.length)];

    // Subtlety decreases as level increases.
    const intensity = Math.max(0.06, 0.7 * Math.pow(0.94, currLevel - 1));

    const tiles = [];
    const baseHue = Math.random() * 360;
    const baseColor = `hsl(${baseHue}, 75%, 55%)`;

    // Early level help: make it glow slightly
    const isEarly = currLevel <= 5;

    for (let i = 0; i < totalTiles; i++) {
      if (i === targetIdx) {
        let style = { backgroundColor: baseColor };

        if (type === 'color') {
          const hueShift = (Math.random() > 0.5 ? 1 : -1) * (40 * intensity);
          style.backgroundColor = `hsl(${baseHue + hueShift}, 75%, 55%)`;
        } else if (type === 'brightness') {
          const bShift = 1 + (Math.random() > 0.5 ? 0.4 : -0.3) * intensity;
          style.filter = `brightness(${bShift})`;
        } else if (type === 'size') {
          style.transform = `scale(${1 - 0.25 * intensity})`;
        } else if (type === 'rotate') {
          style.transform = `rotate(${(Math.random() > 0.5 ? 25 : -25) * intensity}deg)`;
        }

        if (isEarly) {
          style.boxShadow = `0 0 20px rgba(255, 255, 255, ${0.4 * intensity})`;
        }

        tiles.push({ style, content: "" });
      } else {
        tiles.push({
          style: { backgroundColor: baseColor, transform: 'rotate(0deg) scale(1)', filter: 'none' },
          content: ""
        });
      }
    }

    setGridData({ tiles, targetIdx, type, size, isMoving, isFlash });
    setIsTilesHidden(false);

    if (isFlash) {
      setTimeout(() => setIsTilesHidden(true), 1200);
    }

    // Reset timer for new level
    setTimeLeft(Math.max(1.5, INITIAL_TIME * Math.pow(0.92, currLevel - 1)));
  }, []);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setStreak(0);
    setPhase('playing');
    generateLevel(1);
  };

  const handleTileClick = (idx) => {
    if (phase !== 'playing') return;

    if (idx === gridData.targetIdx) {
      // Correct!
      setCorrectIdx(idx);
      const comboMult = 1 + Math.floor(streak / 5) * 0.5;
      const bonus = Math.floor(timeLeft * 20 * comboMult);
      setScore(s => s + Math.round((100 + bonus) * comboMult));

      setStreak(st => {
        const next = st + 1;
        if (next % 5 === 0) {
          setComboMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
          setTimeout(() => setComboMsg(""), 1000);
        }
        return next;
      });

      setTimeout(() => {
        setCorrectIdx(null);
        setLevel(l => {
          const next = l + 1;
          generateLevel(next);
          return next;
        });
      }, 300);
    } else {
      // Wrong!
      setWrongPulse(true);
      setTimeout(() => setWrongPulse(false), 400);
      setStreak(0);
      setTimeLeft(t => Math.max(0, t - 2)); // Penalty
    }
  };

  /* ── TIMER ── */
  useEffect(() => {
    if (phase === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 0.1) {
            setPhase('gameover');
            return 0;
          }
          return t - 0.1;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, timeLeft]);

  /* ── RENDER ── */

  if (phase === 'start') {
    return (
      <div className="ow-screen ow-screen--start">
        <h1 className="ow-title">One Wrong Tile</h1>
        <p className="ow-subtitle">Spot the odd one out. Fast.</p>

        <div className="ow-start-card">
          <div className="ow-preview-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`ow-preview-tile ${i === 4 ? 'ow-preview-tile--odd' : ''}`} />
            ))}
          </div>
          <button className="ow-btn ow-btn--primary" onClick={startGame}>Start Protocol</button>
          <button className="back-btn" onClick={onBack}>← Back to Hub</button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="ow-screen ow-screen--gameover">
        <div className="ow-go-icon">🚫</div>
        <h2 className="ow-go-title">Time Expired</h2>

        <div className="ow-stats-grid">
          <div className="ow-stat">
            <span className="ow-stat-label">Level</span>
            <span className="ow-stat-val">{level}</span>
          </div>
          <div className="ow-stat">
            <span className="ow-stat-label">Score</span>
            <span className="ow-stat-val">{score}</span>
          </div>
        </div>

        <div className="ow-actions">
          <button className="ow-btn ow-btn--primary" onClick={startGame}>Try Again</button>
          <button className="back-btn" onClick={onBack}>Return to Hub</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ow-screen ow-screen--game ${wrongPulse ? 'ow-shake' : ''}`}>
      <div className="ow-hud">
        <div className="ow-hud-item">
          <span className="ow-label">LEVEL</span>
          <span className="ow-val">{level}</span>
        </div>
        <div className="ow-timer-container">
          <div className="ow-timer-bar" style={{ width: `${(timeLeft / INITIAL_TIME) * 100}%` }} />
          <span className="ow-timer-text">{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="ow-hud-item">
          <span className="ow-label">SCORE</span>
          <span className="ow-val">{score}</span>
        </div>
      </div>

      {comboMsg && <div className="ow-combo-popup">{comboMsg}</div>}

      <div
        className={`ow-grid ${gridData.isMoving ? 'ow-grid--moving' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${gridData.size}, 1fr)`,
          maxWidth: `${gridData.size * 80}px`
        }}
      >
        {gridData.tiles.map((tile, i) => (
          <button
            key={i}
            className={`ow-tile ${isTilesHidden ? 'ow-tile--hidden' : ''} ${correctIdx === i ? 'ow-tile--correct' : ''}`}
            style={isTilesHidden ? { backgroundColor: '#1e293b' } : tile.style}
            onClick={() => handleTileClick(i)}
          >
            <span className="ow-tile-content">{tile.content}</span>
          </button>
        ))}
      </div>

      <button className="back-btn" onClick={() => setPhase('start')}>Change Mode</button>
    </div>
  );
}
