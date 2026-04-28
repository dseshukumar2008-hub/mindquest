import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MemoryMatrix.css';
import { playSound } from '../utils/audio';
import ExitConfirmModal from './ExitConfirmModal';

/* ─────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────── */
const MAX_LIVES = 3;
const ROUND_BONUS = 50;
const CARD_PTS = 10;

const GAME_MODES = [
  { id: 'hidden',      title: 'Classic Hidden', desc: 'Cards flash at once. Remember positions.', icon: '👁️' },
  { id: 'sequence',    title: 'Sequence',       desc: 'Cards flash one by one. Repeat exact order.', icon: '🔢' },
  { id: 'color',       title: 'Color Match',    desc: 'Memorise colors. Find the specific color asked.', icon: '🎨' },
  { id: 'distraction', title: 'Distraction',    desc: 'Ignore fake flashing cards.', icon: '😵‍💫' },
];

const CARD_COLORS = [
  { hex: '#ef4444', name: 'RED' },
  { hex: '#3b82f6', name: 'BLUE' },
  { hex: '#22c55e', name: 'GREEN' },
  { hex: '#eab308', name: 'YELLOW' },
  { hex: '#a855f7', name: 'PURPLE' },
  { hex: '#f97316', name: 'ORANGE' },
  { hex: '#ec4899', name: 'PINK' },
  { hex: '#06b6d4', name: 'CYAN' },
];

function getGridSize(round) {
  if (round <= 2) return 2;
  if (round <= 5) return 3;
  if (round <= 8) return 4;
  return 5;
}

function getSequenceLength(round) {
  // Starts with 3 cards, slowly increases
  return Math.min(3 + Math.floor((round - 1) * 0.8), getGridSize(round) ** 2 - 2);
}

function getRecallTime(round) {
  return Math.max(18 - (round - 1) * 0.5, 8);
}

function pickRandom(pool, n) {
  const arr = [...pool];
  const result = [];
  while (result.length < n && arr.length > 0) {
    const i = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(i, 1)[0]);
  }
  return result;
}

function getRandomColor() {
  return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
}



/* ─────────────────────────────────────────────
   HEART DISPLAY
───────────────────────────────────────────── */
function Hearts({ lives }) {
  return (
    <div className="mm-hearts">
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <span key={i} className={`mm-heart ${i < lives ? 'mm-heart--alive' : 'mm-heart--lost'}`}>
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function MemoryMatrix({ onBack }) {
  const [phase, setPhase] = useState('mode-select'); 
  // modeselect | memorize | distracting | recall | round-result | gameover

  const [gameMode, setGameMode] = useState(null); // 'hidden' | 'sequence' | 'color' | 'distraction'

  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const [bestScore, setBestScore] = useState(
    () => parseInt(localStorage.getItem('mm_best_score') || '0', 10)
  );

  // ── Grid & Sequence State ──
  const gridSize = getGridSize(round);
  const totalCards = gridSize * gridSize;
  const seqLength = getSequenceLength(round);
  
  const [sequence, setSequence] = useState([]); // indices ordered
  const [colorMap, setColorMap] = useState({}); // idx -> color object (for color mode)
  const [targetColor, setTargetColor] = useState(null); // the specific color to find
  
  const [activeHighlights, setActiveHighlights] = useState([]); // currently lit up indices
  const [distractions, setDistractions] = useState([]); // currently lit fake indices
  
  const [userStep, setUserStep] = useState(0); // for strict ordering (sequence, color)
  const [selected, setSelected] = useState([]); // all picked so far
  const [cardStatus, setCardStatus] = useState({}); // idx -> 'correct'|'wrong'
  
  const [wrongPulse, setWrongPulse] = useState(false);
  const [isPerfect, setIsPerfect] = useState(true);
  const [showBurst, setShowBurst] = useState(false);

  // ── Timers ──
  const [recallTime, setRecallTime] = useState(0);
  const [memLabel, setMemLabel] = useState(''); // helper text during memorize

  const recallTimerRef = useRef(null);
  const sequenceTimerRef = useRef(null);
  const isMounted = useRef(true);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(sequenceTimerRef.current);
      clearInterval(recallTimerRef.current);
      clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Scroll lock during active game phases
  useEffect(() => {
    const gameplayPhases = ['memorize', 'distracting', 'recall', 'round-result'];
    if (gameplayPhases.includes(phase)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [phase]);

  /* ── Persist best score ── */
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('mm_best_score', score);
    }
  }, [score, bestScore]);

  /* ── CLEANUP ── */
  useEffect(() => () => {
    clearTimeout(sequenceTimerRef.current);
    clearInterval(recallTimerRef.current);
  }, []);

  /* ── START ROUND ── */
  const startRound = useCallback((r, mode) => {
    const gs = getGridSize(r);
    const total = gs * gs;
    const n = getSequenceLength(r);
    
    // Pick sequence
    const seq = pickRandom(Array.from({ length: total }, (_, i) => i), n);
    setSequence(seq);
    
    const cmap = {};
    if (mode === 'color') {
      // Pick n unique colors
      const selectedColors = pickRandom(CARD_COLORS, n);
      seq.forEach((idx, i) => {
        cmap[idx] = selectedColors[i];
      });
      // Pick one to be the target
      const targetIdx = pickRandom(seq, 1)[0];
      setTargetColor({ ...cmap[targetIdx], targetIdx });
    }
    setColorMap(cmap);

    setRound(r);
    setGameMode(mode);
    setSelected([]);
    setCardStatus({});
    setUserStep(0);
    setIsPerfect(true);
    setShowBurst(false);
    setRecallTime(getRecallTime(r));
    setPhase('memorize');
    
    clearTimeout(sequenceTimerRef.current);
  }, []);

  /* ── MEMORIZE PHASE LOGIC ── */
  useEffect(() => {
    if (phase !== 'memorize') return;

    if (gameMode === 'hidden' || gameMode === 'color') {
      // Show all at once
      setActiveHighlights(sequence);
      setMemLabel(gameMode === 'color' ? 'Memorise the colors!' : 'Memorise positions!');
      sequenceTimerRef.current = setTimeout(() => {
        setActiveHighlights([]);
        setPhase('recall');
      }, Math.max(2500 - round * 150, 800));

    } else if (gameMode === 'distraction') {
      // Show targets, then flash distractions
      setActiveHighlights(sequence);
      setMemLabel('Memorise targets!');
      
      sequenceTimerRef.current = setTimeout(() => {
        setActiveHighlights([]);
        setPhase('distracting');
      }, 1800);

    } else if (gameMode === 'sequence') {
      // Flash one by one
      setActiveHighlights([]);
      setMemLabel('Watch the sequence!');
      
      let step = 0;
      const flashDuration = Math.max(800 - round * 50, 300);
      const gapDuration = 200;

      const playNext = () => {
        if (step >= sequence.length) {
          setActiveHighlights([]);
          setPhase('recall');
          return;
        }
        
        setActiveHighlights([sequence[step]]);
        playSound('correct'); // tiny blip

        sequenceTimerRef.current = setTimeout(() => {
          setActiveHighlights([]);
          step++;
          sequenceTimerRef.current = setTimeout(playNext, gapDuration);
        }, flashDuration);
      };

      sequenceTimerRef.current = setTimeout(playNext, 600); // initial delay
    }
  }, [phase, gameMode, sequence, round]);

  /* ── DISTRACTION PHASE LOGIC ── */
  useEffect(() => {
    if (phase !== 'distracting') return;
    
    setMemLabel('Ignore distractions!');
    const availablePool = Array.from({ length: totalCards }, (_, i) => i).filter(i => !sequence.includes(i));
    
    let flashes = 0;
    const maxFlashes = Math.min(3 + round, 10);
    
    const flashFake = () => {
      if (flashes >= maxFlashes) {
        setDistractions([]);
        setPhase('recall');
        return;
      }
      // Pick 1-3 random fakes
      const numFakes = Math.floor(Math.random() * 3) + 1;
      const fakes = pickRandom(availablePool, numFakes);
      setDistractions(fakes);
      
      playSound('wrong'); // chaotic blip
      
      sequenceTimerRef.current = setTimeout(() => {
        setDistractions([]);
        flashes++;
        sequenceTimerRef.current = setTimeout(flashFake, 150); // fast gap
      }, 200); // fast flash
    };

    flashFake();
  }, [phase, sequence, totalCards, round]);


  /* ── RECALL TIMER ── */
  useEffect(() => {
    if (phase !== 'recall') {
      clearInterval(recallTimerRef.current);
      return;
    }
    setMemLabel('');
    recallTimerRef.current = setInterval(() => {
      setRecallTime(t => {
        if (t <= 1) {
          clearInterval(recallTimerRef.current);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(recallTimerRef.current);
  }, [phase]);

  const handleTimeUp = useCallback(() => {
    setPhase('feedback');
    setLives(l => {
      const newL = Math.max(l - 1, 0);
      if (newL === 0) {
        transitionTimeoutRef.current = setTimeout(() => {
          if (isMounted.current) setPhase('gameover');
        }, 1000);
      } else {
        transitionTimeoutRef.current = setTimeout(() => {
          if (isMounted.current) advanceRound(false);
        }, 1200);
      }
      return newL;
    });
    setIsPerfect(false);
  }, [advanceRound]);

  /* ── ADVANCE ── */
  const advanceRound = useCallback((perfect) => {
    if (perfect) {
      setStreak(s => s + 1);
      setScore(s => s + ROUND_BONUS); 
    } else {
      setStreak(0);
    }
    setPhase('round-result');
    transitionTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) startRound(round + 1, gameMode);
    }, 1500);
  }, [round, gameMode, startRound]);

  /* ── HANDLE CARD CLICK ── */
  const handleCardClick = useCallback((idx) => {
    if (phase !== 'recall') return;
    if (selected.includes(idx)) return;
    if (cardStatus[idx] === 'correct') return; // already clicked

    let isCorrect = false;

    if (gameMode === 'sequence') {
      // Must match exact step
      isCorrect = (sequence[userStep] === idx);
    } else if (gameMode === 'color') {
      // Must click the specific target color card
      isCorrect = (idx === targetColor.targetIdx);
    } else {
      // Hidden / Distraction -> any order
      isCorrect = sequence.includes(idx);
    }

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (isCorrect) {
      playSound('correct');
      setCardStatus(prev => ({ ...prev, [idx]: 'correct' }));
      setScore(s => s + CARD_PTS);
      setUserStep(s => s + 1);

      // Check win
      if (gameMode === 'sequence') {
        if (userStep + 1 === sequence.length) {
          triggerWin();
        }
      } else if (gameMode === 'color') {
        // Color mode is one click per round
        triggerWin();
      } else {
        const allFound = sequence.every(h => newSelected.includes(h) || cardStatus[h] === 'correct');
        if (allFound) {
          triggerWin();
        }
      }
    } else {
      // Wrong pick
      playSound('wrong');
      setCardStatus(prev => ({ ...prev, [idx]: 'wrong' }));
      setIsPerfect(false);
      setWrongPulse(true);
      setTimeout(() => setWrongPulse(false), 400);

      // Flash correct ones
      const missed = sequence.filter(s => !newSelected.includes(s));
      setActiveHighlights(missed);

      clearInterval(recallTimerRef.current);
      setLives(l => {
        const newL = l - 1;
        if (newL <= 0) {
          transitionTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) setPhase('gameover');
          }, 1200);
        } else {
          setPhase('feedback');
          transitionTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) advanceRound(false);
          }, 1500);
        }
        return Math.max(newL, 0);
      });
    }
  }, [phase, selected, cardStatus, sequence, gameMode, userStep, advanceRound]);

  const triggerWin = () => {
    clearInterval(recallTimerRef.current);
    if (isPerfect) {
      playSound('perfect');
      setShowBurst(true);
    }
    setPhase('round-result');
    const perf = isPerfect;
    transitionTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) advanceRound(perf);
    }, 1500);
  };

  const resetGame = () => {
    setPhase('mode-select');
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
  };

  const [showExitModal, setShowExitModal] = useState(false);

  /* ────────────────────────────────────────────
     RENDER: MODE SELECT
  ──────────────────────────────────────────── */
  if (phase === 'mode-select') {
    return (
      <div className="mm-screen mm-screen--modes">
        <h2 className="mm-title">Memory Matrix</h2>
        <p className="mm-subtitle">Cognitive Recall Protocol</p>
        <div className="mm-mode-grid">
          {GAME_MODES.map(mode => (
            <button 
              key={mode.id} 
              className="mm-mode-card"
              onClick={() => {
                setLives(MAX_LIVES);
                setScore(0);
                startRound(1, mode.id);
              }}
            >
              <div className="mm-mode-icon">{mode.icon}</div>
              <div className="mm-mode-info">
                <h3>{mode.title}</h3>
                <p>{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button className="back-btn" style={{ marginTop: '24px' }} onClick={onBack}>← Back to Hub</button>
      </div>
    );
  }

  /* ────────────────────────────────────────────
     RENDER: GAMEOVER
  ──────────────────────────────────────────── */
  if (phase === 'gameover') {
    return (
      <div className="mm-screen mm-screen--gameover">
        <div className="mm-go-icon">💀</div>
        <h2 className="mm-go-title">Matrix Overloaded</h2>
        <p className="mm-go-sub">Mode: {GAME_MODES.find(m => m.id === gameMode)?.title}</p>

        <div className="mm-go-stats">
          <div className="mm-go-stat">
            <span className="mm-go-stat-val" style={{ color: '#38bdf8' }}>{score}</span>
            <span className="mm-go-stat-label">Final Score</span>
          </div>
          <div className="mm-go-stat">
            <span className="mm-go-stat-val" style={{ color: '#a855f7' }}>{round}</span>
            <span className="mm-go-stat-label">Level Reached</span>
          </div>
          <div className="mm-go-stat">
            <span className="mm-go-stat-val" style={{ color: '#f97316' }}>{streak}🔥</span>
            <span className="mm-go-stat-label">Best Streak</span>
          </div>
        </div>

        <div className="mm-go-actions">
          <button className="mm-start-btn" onClick={resetGame}>🔄 Change Mode</button>
          <button className="mm-start-btn" style={{ background: 'transparent', border: '1px solid #a855f7' }} onClick={() => startRound(1, gameMode)}>⚡ Play Again</button>
          <button className="back-btn" onClick={onBack}>← Hub</button>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────
     RENDER: GAMEPLAY
  ──────────────────────────────────────────── */
  const recallPct = recallTime / getRecallTime(round);
  const timerDanger = recallTime <= 4 && phase === 'recall';
  
  // Calculate how many found for header
  let foundCount = 0;
  if (gameMode === 'sequence') foundCount = userStep;
  else if (gameMode === 'color') foundCount = selected.length;
  else foundCount = selected.filter(i => sequence.includes(i)).length;

  return (
    <div className={`mm-screen mm-screen--game ${wrongPulse ? 'mm-wrong-shake' : ''}`}>
      
      {showBurst && <div className="mm-burst-overlay"><div className="mm-burst-text">PERFECT!</div></div>}

      {/* ── HUD ── */}
      <div className="mm-hud">
        <Hearts lives={lives} />
        <div className="mm-hud-center">
          <div className="mm-level-badge">LVL {round}</div>
          {streak >= 2 && <div className="mm-streak-badge" key={streak}>🔥 ×{streak}</div>}
        </div>
        <div className="mm-hud-right">
          <span className="mm-score">{score}</span>
          <span className="mm-score-label">PTS</span>
        </div>
      </div>

      {/* ── Phase banner ── */}
      <div className={`mm-phase-banner mm-phase-banner--${phase}`}>
        {['memorize', 'distracting'].includes(phase) && <span>👁️ {memLabel}</span>}
        {phase === 'recall' && gameMode === 'color' && targetColor && (
          <span>🧠 Find the <strong style={{ color: targetColor.hex, textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>{targetColor.name}</strong> card!</span>
        )}
        {phase === 'recall' && gameMode !== 'color' && <span>🧠 Find {seqLength} cards — {foundCount}/{seqLength} found</span>}
        {phase === 'round-result' && <span>{isPerfect ? '✨ Perfect Round! +50 bonus' : '✓ Round Complete'}</span>}
        {phase === 'feedback' && <span>⏰ Matrix Failure</span>}
      </div>

      {/* ── Recall timer bar ── */}
      {phase === 'recall' && (
        <div className="mm-timer-bar">
          <div
            className={`mm-timer-bar-fill ${timerDanger ? 'mm-timer-bar-fill--danger' : ''}`}
            style={{ width: `${recallPct * 100}%`, transition: 'width 0.9s linear' }}
          />
        </div>
      )}

      {/* ── Card grid ── */}
      <div
        className={`mm-grid mm-grid--${gridSize}`}
        style={{ '--grid-cols': gridSize }}
      >
        {Array.from({ length: totalCards }, (_, idx) => {
          const isTargetHighlight = activeHighlights.includes(idx);
          const isDistraction = distractions.includes(idx);
          const status = cardStatus[idx];
          
          let cardColor = null;
          if (gameMode === 'color' && (isTargetHighlight || status === 'correct' || (phase === 'round-result' && sequence.includes(idx)))) {
            cardColor = colorMap[idx]?.hex || '#fff';
          }

          let cardCls = 'mm-card';
          if (isTargetHighlight) cardCls += ' mm-card--highlight';
          if (isDistraction) cardCls += ' mm-card--distraction';
          if (status === 'correct') cardCls += ' mm-card--correct';
          if (status === 'wrong') cardCls += ' mm-card--wrong';
          if (phase === 'recall' && !status) cardCls += ' mm-card--clickable';
          if (phase === 'round-result' && sequence.includes(idx) && !status) cardCls += ' mm-card--reveal';

          return (
            <div
              key={idx}
              className={cardCls}
              onClick={() => handleCardClick(idx)}
              style={cardColor ? { '--custom-glow': cardColor } : {}}
            >
              {(isTargetHighlight || status === 'correct') && <div className="mm-card-glow-ring" />}
              {status === 'correct' && <span className="mm-card-mark">✓</span>}
              {status === 'wrong' && <span className="mm-card-mark">✗</span>}
              {phase === 'round-result' && sequence.includes(idx) && !status && (
                <span className="mm-card-mark mm-card-mark--reveal">●</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Round info row ── */}
      <div className="mm-round-info">
        <span className="mm-round-label">{GAME_MODES.find(m => m.id === gameMode)?.title}</span>
        <span className="mm-grid-label">{gridSize}×{gridSize} grid</span>
      </div>

      <button className="back-btn" style={{ marginTop: '8px', opacity: 0.55 }} onClick={() => setShowExitModal(true)}>
        ← Exit
      </button>
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={onBack}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
}
