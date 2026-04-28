import os

jsx_path = r"e:\mind quest\src\components\VisualTrapMemory.jsx"
css_path = r"e:\mind quest\src\components\VisualTrapMemory.css"

jsx_content = """import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VisualTrapMemory.css';

const EMOJI_SETS = [
  ['🍐', '🍏', '🥝', '🍈', '🥦', '🥬'],
  ['🏀', '📙', '🍊', '🧶', '🦁', '🐅'],
  ['💎', '🧊', '❄️', '💧', '🥣', '🐟'],
  ['🍎', '🍓', '🍒', '🍅', '🔴', '👺'],
  ['🐱', '🐯', '🦁', '🦊', '🐶', '🐺'],
  ['⏰', '⏲️', '⌚', '🕰️', '🧭', '⌛'],
  ['🌑', '🌚', '🖤', '🎱', '💣', '🕷️'],
];

const MAX_ROUNDS = 5;

// Sound effects
const playSound = (type) => {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) { }
};

export default function VisualTrapMemory({ onBack }) {
  const [phase, setPhase] = useState('start'); // start | getReady | memorize | distract | question | feedback | gameover
  
  // Game Stats
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [gameData, setGameData] = useState(null); 
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'wrong'
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [countdown, setCountdown] = useState(3);
  
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);

  /* ── GAME LOGIC ── */

  const generateRound = useCallback((currRound) => {
    const set = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
    // As round increases, number of items increases (min 3, max 6)
    const count = Math.min(6, 2 + currRound);
    const sequence = [...set].sort(() => Math.random() - 0.5).slice(0, count);
    
    // Distractor pool (items not in sequence)
    const distractors = set.filter(e => !sequence.includes(e));
    const fakeItem = distractors[0] || '❓';
    
    // Choose specific cognitive question types
    // 0: NOT shown
    // 1: 1st item
    // 2: Middle item
    // 3: Last item
    const qType = Math.floor(Math.random() * 4);
    let question = "";
    let options = [];
    let targetValue = null;

    if (qType === 0) {
      question = "Which item was NOT shown?";
      targetValue = fakeItem;
      options = [targetValue, ...sequence.sort(() => Math.random() - 0.5).slice(0, 3)];
    } else if (qType === 1) {
      question = "What was the FIRST item?";
      targetValue = sequence[0];
      options = [targetValue, sequence[1], sequence[sequence.length-1], fakeItem];
    } else if (qType === 2 && sequence.length > 2) {
      const midIdx = Math.floor(sequence.length / 2);
      question = "What was in the MIDDLE?";
      targetValue = sequence[midIdx];
      options = [targetValue, sequence[0], sequence[sequence.length-1], fakeItem];
    } else {
      question = "Which item appeared LAST?";
      targetValue = sequence[sequence.length - 1];
      options = [targetValue, sequence[0], sequence[1], fakeItem];
    }

    // Ensure options are unique, fallback if needed
    options = [...new Set(options)];
    while(options.length < 4 && distractors.length > 0) {
       options.push(distractors.pop());
       options = [...new Set(options)];
    }

    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    setGameData({ 
      sequence, 
      set, 
      question, 
      options: shuffledOptions, 
      correctIdx: shuffledOptions.indexOf(targetValue),
      fakeFlash: currRound >= 3 ? fakeItem : null // Distractor flash for harder rounds
    });
    
    setSelectedOpt(null);
    setFeedbackState(null);
    setCountdown(3);
    setPhase('getReady');
  }, []);

  useEffect(() => {
    if (phase === 'getReady') {
      timeoutRef.current = setTimeout(() => {
        setPhase('memorize');
      }, 1000);
    } 
    else if (phase === 'memorize') {
      // Countdown logic
      let c = 3;
      timerRef.current = setInterval(() => {
        c -= 1;
        if (c > 0) {
          setCountdown(c);
          playSound('tick');
        } else {
          clearInterval(timerRef.current);
          setPhase('question');
          setTimeLeft(Math.max(3, 6 - round * 0.5)); // faster as rounds go up
        }
      }, Math.max(600, 1000 - round * 100)); // speed up memorize time
    } 
    else if (phase === 'question') {
      // Question timer
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 0.1) {
            clearInterval(timerRef.current);
            handleAnswer(-1); // Timeout
            return 0;
          }
          return t - 0.1;
        });
      }, 100);
    }

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(timerRef.current);
    };
  }, [phase, round]);

  const startGame = () => {
    setScore(0);
    setRound(1);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    generateRound(1);
  };

  const handleAnswer = (idx) => {
    if (phase !== 'question') return;
    clearInterval(timerRef.current);
    setSelectedOpt(idx);

    const isCorrect = idx === gameData.correctIdx;
    setFeedbackState(isCorrect ? 'correct' : 'wrong');
    setPhase('feedback');
    playSound(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setCorrectCount(c => c + 1);
      
      const streakMultiplier = 1 + (newStreak * 0.1);
      setScore(s => Math.floor(s + (100 * streakMultiplier) + (timeLeft * 20)));
    } else {
      setStreak(0);
    }

    // Auto advance
    timeoutRef.current = setTimeout(() => {
      if (round >= MAX_ROUNDS) {
        setPhase('gameover');
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        generateRound(nextRound);
      }
    }, 1200);
  };

  /* ── RENDER ── */

  if (phase === 'start') {
    return (
      <div className="vtm-screen vtm-screen--start">
        <h1 className="vtm-title">Visual Trap</h1>
        <p className="vtm-subtitle">The ultimate cognitive recall challenge.</p>
        
        <div className="vtm-start-card">
           <div className="vtm-preview-row">
             <span>🧠</span><span>👁️</span><span>⏱️</span>
           </div>
           <button className="vtm-btn vtm-btn--primary" onClick={startGame}>Enter The Trap</button>
           <button className="back-btn" onClick={onBack}>← Back to Hub</button>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    const accuracy = Math.round((correctCount / MAX_ROUNDS) * 100);
    return (
      <div className="vtm-screen vtm-screen--gameover">
        <div className="vtm-go-icon">🏆</div>
        <h2 className="vtm-go-title">Challenge Complete</h2>
        <div className="vtm-stats-grid">
          <div className="vtm-stat">
            <span className="vtm-stat-label">Final Score</span>
            <span className="vtm-stat-val">{score}</span>
          </div>
          <div className="vtm-stat">
            <span className="vtm-stat-label">Accuracy</span>
            <span className="vtm-stat-val">{accuracy}%</span>
          </div>
          <div className="vtm-stat">
            <span className="vtm-stat-label">Best Streak</span>
            <span className="vtm-stat-val">🔥 {bestStreak}</span>
          </div>
        </div>
        <button className="vtm-btn vtm-btn--primary" onClick={startGame}>Play Again</button>
        <button className="back-btn" onClick={onBack}>Exit to Hub</button>
      </div>
    );
  }

  return (
    <div className={`vtm-screen vtm-screen--play phase-${phase} ${phase === 'feedback' ? `vtm-bg-${feedbackState}` : ''}`}>
      <div className="vtm-hud">
        <div className="vtm-hud-left">
          <span className="vtm-hud-round">Round {round} / {MAX_ROUNDS}</span>
          {streak > 1 && <span className="vtm-hud-streak">🔥 Streak {streak}</span>}
        </div>
        <div className="vtm-hud-right">
          <span className="vtm-hud-score">{score}</span>
        </div>
      </div>

      <div className="vtm-content">
        
        {phase === 'getReady' && (
          <div className="vtm-get-ready">
            <h2 className="vtm-ready-text">Get Ready...</h2>
            <p className="vtm-ready-sub">Focus. Don't blink.</p>
          </div>
        )}

        {phase === 'memorize' && (
          <div className="vtm-memorize-container">
            <div className="vtm-countdown">{countdown}</div>
            <div className="vtm-sequence">
              {gameData.sequence.map((emoji, i) => (
                <div key={i} className="vtm-item vtm-item-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                  {emoji}
                </div>
              ))}
              {gameData.fakeFlash && countdown === 2 && (
                <div className="vtm-item vtm-item-fake-flash">{gameData.fakeFlash}</div>
              )}
            </div>
          </div>
        )}

        {(phase === 'question' || phase === 'feedback') && (
          <div className="vtm-question-container">
            <h2 className="vtm-question-text">{gameData.question}</h2>
            {phase === 'question' && (
              <div className="vtm-q-timer-container">
                <div className="vtm-q-timer-bar" style={{ width: `${(timeLeft / Math.max(3, 6 - round * 0.5)) * 100}%` }} />
              </div>
            )}
            <div className="vtm-options">
              {gameData.options.map((opt, i) => {
                let btnClass = 'vtm-opt-btn ';
                if (phase === 'feedback') {
                  if (i === gameData.correctIdx) btnClass += 'vtm-opt-btn--correct';
                  else if (i === selectedOpt) btnClass += 'vtm-opt-btn--wrong';
                  else btnClass += 'vtm-opt-btn--dim';
                }
                return (
                  <button 
                    key={i} 
                    className={btnClass}
                    onClick={() => handleAnswer(i)}
                    disabled={phase === 'feedback'}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {phase === 'feedback' && (
              <div className={`vtm-feedback-toast vtm-toast-${feedbackState}`}>
                {feedbackState === 'correct' ? 'SHARP! ✓' : 'TRAPPED! ✗'}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
"""

css_content = """/* ═══════════════════════════════════════════════
   VISUAL TRAP MEMORY — Refactored Styles
   ═══════════════════════════════════════════════ */

.vtm-screen {
  position: fixed;
  inset: 0;
  background: #080a0f;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  overflow: hidden;
  user-select: none;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s ease;
}

/* Background feedback flashes */
.vtm-bg-correct { background-color: rgba(16, 185, 129, 0.1); }
.vtm-bg-wrong { 
  background-color: rgba(239, 68, 68, 0.15); 
  animation: vtmShake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes vtmShake {
  10%, 90% { transform: translate3d(-2px, 0, 0); }
  20%, 80% { transform: translate3d(4px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
  40%, 60% { transform: translate3d(8px, 0, 0); }
}

/* ── HUD ── */
.vtm-hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 900px;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 24px;
}

.vtm-hud-left { display: flex; align-items: center; gap: 24px; }
.vtm-hud-round { font-size: 1.2rem; font-weight: 800; color: #cbd5e1; }
.vtm-hud-streak { font-size: 1rem; font-weight: 800; color: #f97316; animation: popIn 0.3s ease; }

.vtm-hud-right { display: flex; justify-content: flex-end; }
.vtm-hud-score { font-size: 2rem; font-weight: 900; color: #f0abfc; font-variant-numeric: tabular-nums; }

/* ── START SCREEN ── */
.vtm-screen--start { justify-content: center; text-align: center; }
.vtm-title {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 900;
  background: linear-gradient(135deg, #f0abfc 0%, #c026d3 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
}
.vtm-subtitle { color: #94a3b8; font-size: 1.1rem; margin-bottom: 48px; }
.vtm-start-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 32px;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}
.vtm-preview-row { font-size: 3rem; display: flex; gap: 16px; margin-bottom: 8px; }

/* ── CONTENT AREA ── */
.vtm-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* ── GET READY ── */
.vtm-get-ready { text-align: center; animation: zoomIn 0.4s ease forwards; }
.vtm-ready-text { font-size: 3.5rem; font-weight: 900; color: #fff; margin-bottom: 8px; }
.vtm-ready-sub { font-size: 1.5rem; color: #c026d3; font-weight: 700; letter-spacing: 2px; }

@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* ── MEMORIZE ── */
.vtm-memorize-container { position: relative; text-align: center; width: 100%; max-width: 800px; }
.vtm-countdown {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 4rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.8);
  animation: pingCount 1s infinite;
}

@keyframes pingCount {
  0% { transform: translateX(-50%) scale(1.2); opacity: 1; }
  100% { transform: translateX(-50%) scale(0.8); opacity: 0; }
}

.vtm-sequence {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
}

.vtm-item {
  font-size: 4rem;
  background: rgba(255, 255, 255, 0.05);
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: vtmItemPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.vtm-item-pulse {
  animation: vtmItemPop 0.4s both, vtmItemGlow 2s infinite alternate;
}

@keyframes vtmItemPop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes vtmItemGlow {
  from { box-shadow: 0 0 10px rgba(192, 38, 211, 0.2); border-color: rgba(192, 38, 211, 0.3); }
  to { box-shadow: 0 0 25px rgba(192, 38, 211, 0.6); border-color: rgba(192, 38, 211, 0.8); }
}

/* Distractor Flash */
.vtm-item-fake-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.5);
  opacity: 0;
  filter: blur(2px) grayscale(0.5);
  pointer-events: none;
  animation: fakeFlash 0.15s ease-out;
  z-index: 100;
}
@keyframes fakeFlash {
  0% { opacity: 0.8; transform: translate(-50%, -50%) scale(2); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
}

/* ── QUESTION ── */
.vtm-question-container {
  text-align: center;
  animation: fadeUp 0.4s ease both;
  width: 100%;
  max-width: 700px;
}

.vtm-question-text { font-size: 2.2rem; font-weight: 800; margin-bottom: 32px; line-height: 1.3; }

.vtm-q-timer-container { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; margin-bottom: 32px; overflow: hidden; }
.vtm-q-timer-bar { height: 100%; background: linear-gradient(90deg, #c026d3, #f0abfc); transition: width 0.1s linear; }

.vtm-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }

.vtm-opt-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  font-size: 3.5rem;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vtm-opt-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
}

.vtm-opt-btn--correct { background: #10b981 !important; border-color: #10b981 !important; box-shadow: 0 0 30px rgba(16, 185, 129, 0.4); transform: scale(1.05); z-index: 2; }
.vtm-opt-btn--wrong { background: #ef4444 !important; border-color: #ef4444 !important; }
.vtm-opt-btn--dim { opacity: 0.3; transform: scale(0.95); }

/* ── FEEDBACK TOAST ── */
.vtm-feedback-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 40px;
  border-radius: 100px;
  font-weight: 900;
  font-size: 1.5rem;
  animation: vtmToastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 2000;
}

.vtm-toast-correct { background: #10b981; color: #fff; }
.vtm-toast-wrong { background: #ef4444; color: #fff; }

@keyframes vtmToastIn {
  from { transform: translate(-50%, 60px) scale(0.8); opacity: 0; }
  to { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

/* ── GAMEOVER ── */
.vtm-screen--gameover { justify-content: center; gap: 32px; }
.vtm-go-icon { font-size: 5rem; animation: popIn 0.5s ease; }
.vtm-go-title { font-size: 3rem; font-weight: 900; }
.vtm-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 800px; width: 100%; }

.vtm-stat {
  background: rgba(255, 255, 255, 0.05);
  padding: 32px 24px;
  border-radius: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vtm-stat-label { font-size: 0.9rem; color: #94a3b8; font-weight: 800; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
.vtm-stat-val { font-size: 2.5rem; font-weight: 900; color: #c026d3; }

/* ── BUTTONS ── */
.vtm-btn {
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 800;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vtm-btn--primary {
  background: linear-gradient(135deg, #f0abfc, #c026d3);
  color: #fff;
  box-shadow: 0 8px 24px rgba(192, 38, 211, 0.3);
}

.vtm-btn--primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(192, 38, 211, 0.5);
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  padding: 10px 24px;
  border-radius: 100px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover { background: rgba(255, 255, 255, 0.12); color: #fff; transform: translateY(-2px); }

@media (max-width: 600px) {
  .vtm-stats-grid { grid-template-columns: 1fr; }
  .vtm-options { grid-template-columns: 1fr; }
  .vtm-opt-btn { padding: 16px; font-size: 2.5rem; }
  .vtm-question-text { font-size: 1.5rem; }
  .vtm-item { width: 80px; height: 80px; font-size: 3rem; }
}

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes fadeUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
"""

with open(jsx_path, "w", encoding="utf-8") as f:
    f.write(jsx_content)

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)

print("Visual Trap Refactor complete")
