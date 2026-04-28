import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ReflexRush.css';
import { playSound } from '../utils/audio';
import ExitConfirmModal from './ExitConfirmModal';

/* ─────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────── */
const MAX_ROUNDS = 10;

const GAME_MODES = [
  { id: 'classic',   title: 'Classic Mode',   desc: 'Click ANYWHERE as soon as the screen turns green.', icon: '⚡' },
  { id: 'color',     title: 'Color Mode',     desc: 'Click the specific COLOR requested when it turns green.', icon: '🎨' },
  { id: 'confusion', title: 'Confusion Mode', desc: 'Click the INK COLOR of the word. Ignore what the word says!', icon: '😵‍💫' },
];

const COLORS = [
  { hex: '#ef4444', name: 'RED' },
  { hex: '#3b82f6', name: 'BLUE' },
  { hex: '#22c55e', name: 'GREEN' },
  { hex: '#eab308', name: 'YELLOW' },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRank(avgMs) {
  if (avgMs === null || avgMs === undefined) return { label: 'Unranked', color: '#64748b' };
  if (avgMs < 220) return { label: 'Legend', color: '#eab308' }; // Gold
  if (avgMs < 320) return { label: 'Pro', color: '#a855f7' }; // Purple
  if (avgMs < 450) return { label: 'Fast', color: '#38bdf8' }; // Cyan
  return { label: 'Slow', color: '#ef4444' }; // Red
}



/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function ReflexRush({ onBack }) {
  const [phase, setPhase] = useState('mode-select'); 
  // mode-select | ready | waiting | fake | react | round-result | false-start | gameover

  const [gameMode, setGameMode] = useState(null);
  const [round, setRound] = useState(1);
  const [times, setTimes] = useState([]); // ms times per round
  const [lastTime, setLastTime] = useState(null); // time of current round

  // For Color/Confusion modes
  const [targetTask, setTargetTask] = useState(null); 
  // { wordText: 'RED', wordColor: '#3b82f6', requestedColorHex: '#3b82f6', requestedColorName: 'BLUE' }
  const [options, setOptions] = useState([]); // colors to show as buttons

  const [bestAvg, setBestAvg] = useState(
    () => parseInt(localStorage.getItem('rr_best_avg') || '9999', 10)
  );

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const isMounted = useRef(true);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(timerRef.current);
      clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Scroll lock during active game phases
  useEffect(() => {
    const gameplayPhases = ['ready', 'waiting', 'fake', 'react', 'round-result', 'false-start'];
    if (gameplayPhases.includes(phase)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [phase]);

  /* ── CLEANUP ── */
  useEffect(() => () => clearTimeout(timerRef.current), []);

  /* ── START GAME ── */
  const startGame = useCallback((mode) => {
    setGameMode(mode);
    setRound(1);
    setTimes([]);
    setLastTime(null);
    startRound(1, mode);
  }, []);

  /* ── START ROUND ── */
  const startRound = useCallback((r, mode) => {
    setRound(r);
    setPhase('ready');
    
    // Generate tasks for color/confusion
    if (mode === 'color' || mode === 'confusion') {
      const isConfusion = mode === 'confusion';
      const c1 = pickRandom(COLORS);
      const c2 = pickRandom(COLORS);
      
      const requested = isConfusion ? c2 : c1; // Confusion: click ink color (c2). Color: click word color (c1).
      
      setTargetTask({
        wordText: c1.name,
        wordColor: c2.hex,
        requestedColorHex: requested.hex,
        requestedColorName: requested.name
      });
      
      // Shuffle 4 options
      setOptions([...COLORS].sort(() => Math.random() - 0.5));
    }

    timerRef.current = setTimeout(() => {
      setPhase('waiting');
      playSound('wait');
      scheduleTriggers();
    }, 1500);
  }, []);

  /* ── TRIGGER SCHEDULING ── */
  const scheduleTriggers = useCallback(() => {
    const delayToReact = Math.random() * 3000 + 1500; // 1.5s to 4.5s
    const willFake = Math.random() > 0.6; // 40% chance of fake trigger

    if (willFake) {
      const fakeDelay = Math.random() * (delayToReact - 800) + 500;
      timerRef.current = setTimeout(() => {
        if (!isMounted.current) return;
        setPhase('fake');
        playSound('fake');
        
        timerRef.current = setTimeout(() => {
          if (!isMounted.current) return;
          setPhase('waiting');
          
          timerRef.current = setTimeout(() => {
            if (!isMounted.current) return;
            triggerGo();
          }, delayToReact - fakeDelay - 300);
        }, 300); // fake duration

      }, fakeDelay);
    } else {
      timerRef.current = setTimeout(() => {
        if (!isMounted.current) return;
        triggerGo();
      }, delayToReact);
    }
  }, []);

  const triggerGo = () => {
    setPhase('react');
    playSound('go');
    startTimeRef.current = performance.now();
  };

  /* ── HANDLE CLICKS ── */
  const handleClick = (clickedHex = null) => {
    if (phase === 'ready') return; // Ignore clicks during 'ready'

    if (phase === 'waiting' || phase === 'fake') {
      // False start!
      clearTimeout(timerRef.current);
      setPhase('false-start');
      playSound('wrong');
      setLastTime('FALSE START (+500ms penalty)');
      
      transitionTimeoutRef.current = setTimeout(() => {
        if (!isMounted.current) return;
        setTimes(prev => {
          const newTimes = [...prev, 500];
          advanceRound(newTimes);
          return newTimes;
        });
      }, 2000);
      return;
    }

    if (phase === 'react') {
      const reactTime = performance.now() - startTimeRef.current;
      
      if (gameMode === 'color' || gameMode === 'confusion') {
        if (!clickedHex) return; // Background click ignored in these modes
        
        if (clickedHex !== targetTask.requestedColorHex) {
          // Wrong color! Treat as severe penalty
          setPhase('false-start');
          playSound('error');
          setLastTime('WRONG TARGET (+1000ms penalty)');
          
          transitionTimeoutRef.current = setTimeout(() => {
            if (!isMounted.current) return;
            const newTimes = [...times, 1000];
            setTimes(newTimes);
            advanceRound(newTimes);
          }, 2000);
          return;
        }
      }

      // Success!
      const finalTime = Math.round(reactTime);
      setPhase('round-result');
      setLastTime(`${finalTime} ms`);
      
      transitionTimeoutRef.current = setTimeout(() => {
        if (!isMounted.current) return;
        const newTimes = [...times, finalTime];
        setTimes(newTimes);
        advanceRound(newTimes);
      }, 1500);
    }
  };

  /* ── ADVANCE ROUND ── */
  const advanceRound = (currentTimes) => {
    if (currentTimes.length >= MAX_ROUNDS) {
      setPhase('gameover');
      const avg = Math.round(currentTimes.reduce((a, b) => a + b, 0) / MAX_ROUNDS);
      if (avg < bestAvg) {
        setBestAvg(avg);
        localStorage.setItem('rr_best_avg', avg);
      }
    } else {
      startRound(currentTimes.length + 1, gameMode);
    }
  };

  /* ────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────── */

  // MODE SELECT
  if (phase === 'mode-select') {
    return (
      <div className="rr-screen rr-screen--modes">
        <h2 className="rr-title">Reflex Rush</h2>
        <p className="rr-subtitle">Reaction Speed Protocol</p>
        
        {bestAvg < 9999 && (
          <div className="rr-best-badge">🏆 Best Average: {bestAvg}ms</div>
        )}

        <div className="rr-mode-grid">
          {GAME_MODES.map(mode => (
            <button key={mode.id} className="rr-mode-card" onClick={() => startGame(mode.id)}>
              <div className="rr-mode-icon">{mode.icon}</div>
              <div className="rr-mode-info">
                <h3>{mode.title}</h3>
                <p>{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button className="back-btn" onClick={onBack} style={{ marginTop: '32px' }}>← Back to Hub</button>
      </div>
    );
  }

  // GAMEOVER
  if (phase === 'gameover') {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / MAX_ROUNDS);
    const rank = getRank(avg);

    return (
      <div className="rr-screen rr-screen--gameover">
        <div className="rr-go-icon">⚡</div>
        <h2 className="rr-go-title">Protocol Complete</h2>
        <p className="rr-go-sub">Mode: {GAME_MODES.find(m => m.id === gameMode)?.title}</p>

        <div className="rr-rank-box" style={{ borderColor: rank.color, boxShadow: `0 0 20px ${rank.color}40` }}>
          <span className="rr-rank-label">Classification</span>
          <span className="rr-rank-value" style={{ color: rank.color }}>{rank.label}</span>
        </div>

        <div className="rr-go-stats">
          <div className="rr-go-stat">
            <span className="rr-go-stat-val" style={{ color: '#38bdf8' }}>{avg} ms</span>
            <span className="rr-go-stat-label">Average Time</span>
          </div>
          <div className="rr-go-stat">
            <span className="rr-go-stat-val" style={{ color: '#f59e0b' }}>{bestAvg < 9999 ? bestAvg : '-'}</span>
            <span className="rr-go-stat-label">Personal Best</span>
          </div>
        </div>

        <div className="rr-go-actions">
          <button className="rr-start-btn" onClick={() => setPhase('mode-select')}>🔄 Change Mode</button>
          <button className="rr-start-btn" style={{ background: 'transparent', border: '1px solid #f97316', color: '#f97316' }} onClick={() => startGame(gameMode)}>⚡ Try Again</button>
          <button className="back-btn" onClick={onBack}>← Hub</button>
        </div>
      </div>
    );
  }

  // GAMEPLAY
  let screenClass = 'rr-play-area ';
  if (phase === 'ready') screenClass += 'rr-bg-ready';
  else if (phase === 'waiting') screenClass += 'rr-bg-waiting';
  else if (phase === 'fake') screenClass += 'rr-bg-fake';
  else if (phase === 'react') screenClass += 'rr-bg-react';
  else if (phase === 'false-start') screenClass += 'rr-bg-error';
  else if (phase === 'round-result') screenClass += 'rr-bg-result';

  return (
    <div className="rr-screen rr-screen--game">
      {/* HUD */}
      <div className="rr-hud">
        <div className="rr-hud-round">Round {round} / {MAX_ROUNDS}</div>
        <button className="back-btn" onClick={() => setShowExitModal(true)}>Exit</button>
      </div>

      {/* Main Interactive Area */}
      <div className={screenClass} onClick={() => (gameMode === 'classic' || phase === 'waiting' || phase === 'fake' || phase === 'false-start' || phase === 'round-result') ? handleClick() : null}>
        
        {phase === 'ready' && (
          <>
            <div className="rr-msg">Get Ready...</div>
            <button 
              className="back-btn" 
              onClick={(e) => { e.stopPropagation(); setPhase('mode-select'); }}
            >
              🔄 Change Mode
            </button>
          </>
        )}
        
        {phase === 'waiting' && <div className="rr-msg">WAIT...</div>}
        
        {phase === 'fake' && <div className="rr-msg rr-msg--shake">HOLD!</div>}
        
        {phase === 'false-start' && (
          <div className="rr-msg rr-msg--shake">
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>❌</div>
            {lastTime}
          </div>
        )}
        
        {phase === 'round-result' && (
          <div className="rr-msg">
            <div style={{ fontSize: '2rem', marginBottom: '10px', color: '#818cf8' }}>⏱️ Reaction Time</div>
            {lastTime}
          </div>
        )}

        {phase === 'react' && (
          <div className="rr-react-content">
            {gameMode === 'classic' && <div className="rr-msg rr-msg--large">CLICK NOW!</div>}
            
            {(gameMode === 'color' || gameMode === 'confusion') && targetTask && (
              <div className="rr-task-container">
                <div className="rr-task-instruction">
                  {gameMode === 'confusion' ? 'Click the INK COLOR of this word:' : 'Click the color this word says:'}
                </div>
                <div 
                  className="rr-task-word" 
                  style={{ color: gameMode === 'confusion' ? targetTask.wordColor : '#fff' }}
                >
                  {targetTask.wordText}
                </div>
                <div className="rr-options-grid">
                  {options.map(c => (
                    <button 
                      key={c.hex} 
                      className="rr-color-btn" 
                      style={{ background: c.hex, boxShadow: `0 0 20px ${c.hex}80` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(c.hex);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={onBack}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
