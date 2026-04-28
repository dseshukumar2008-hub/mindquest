import React, { useState, useEffect, useRef, useCallback } from 'react';
import './VisualTrapMemory.css';
import { playSound } from '../utils/audio';
import ExitConfirmModal from './ExitConfirmModal';

const EMOJI_SETS = [
  ['🍐', '🍏', '🥝', '🍈', '🥦', '🥬'],
  ['🏀', '📙', '🍊', '🧶', '🦁', '🐅'],
  ['💎', '🧊', '❄️', '💧', '🥣', '🐟'],
  ['🍎', '🍓', '🍒', '🍅', '🔴', '👺'],
  ['🐱', '🐯', '🦁', '🦊', '🐶', '🐺'],
  ['⏰', '⏲️', '⌚', '🕰️', '🧭', '⌛'],
  ['🌑', '🌚', '🖤', '🎱', '💣', '🕷️'],
];

const MAX_ROUNDS = 10;

// Returns a fair, slightly unpredictable time limit: 5–8 seconds
const getTimeLimit = () => Math.floor(Math.random() * 4) + 5;



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
  const [roundTimeLimit, setRoundTimeLimit] = useState(5); // track the limit for this round
  const [countdown, setCountdown] = useState(3);
  const [isExiting, setIsExiting] = useState(false);
  
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(timeoutRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  // Scroll lock during active game phases
  useEffect(() => {
    const gameplayPhases = ['getReady', 'memorize', 'distract', 'question', 'feedback'];
    if (gameplayPhases.includes(phase)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [phase]);

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
    setCountdown(5);
    setPhase('getReady');
  }, []);

  useEffect(() => {
    if (isExiting) return;

    if (phase === 'getReady') {
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) setPhase('memorize');
      }, 1000);
    }
    else if (phase === 'memorize') {
      // Show items for 5 full seconds with a clear 5→1 countdown
      let c = 5;
      setCountdown(5);
      timerRef.current = setInterval(() => {
        c -= 1;
        if (c > 0) {
          setCountdown(c);
          playSound('tick');
        } else {
          clearInterval(timerRef.current);
          // Items have been shown for 5 seconds — now show the question
          const limit = getTimeLimit();
          setRoundTimeLimit(limit);
          setTimeLeft(limit);
          setPhase('question');
        }
      }, 1000); // exactly 1 second per tick
    }
    else if (phase === 'question') {
      // Question answer timer (5–8s, counting down in 0.1s steps)
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 0.1) {
            clearInterval(timerRef.current);
            handleAnswer(-1); // Timeout
            return 0;
          }
          return parseFloat((t - 0.1).toFixed(1));
        });
      }, 100);
    }
    else if (phase === 'feedback') {
      timeoutRef.current = setTimeout(() => {
        if (!isMounted.current) return;
        if (round >= MAX_ROUNDS) {
          setPhase('gameover');
        } else {
          const nextRound = round + 1;
          setRound(nextRound);
          generateRound(nextRound);
        }
      }, 1200);
    }

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(timerRef.current);
    };
  }, [phase, round, generateRound, isExiting]);

  const startGame = () => {
    setScore(0);
    setRound(1);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setIsExiting(false);
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
    // Note: Auto advance is now handled by the useEffect watching phase === 'feedback'
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
          <button className="vtm-hub-btn" onClick={() => setIsExiting(true)} title="Return to Hub">← Hub</button>
          <div className="vtm-hud-divider" />
          <span className="vtm-hud-round">Round {round} / {MAX_ROUNDS}</span>
          {streak > 1 && <span className="vtm-hud-streak">🔥 {streak}</span>}
        </div>
        <div className="vtm-hud-right">
          <span className="vtm-hud-score">{score}</span>
        </div>
      </div>

      <ExitConfirmModal
        isOpen={isExiting}
        onConfirm={onBack}
        onCancel={() => setIsExiting(false)}
      />

      <div className="vtm-content">
        
        {phase === 'getReady' && (
          <div className="vtm-get-ready">
            <h2 className="vtm-ready-text">Get Ready...</h2>
            <p className="vtm-ready-sub">Focus. Don't blink.</p>
          </div>
        )}

        {phase === 'memorize' && (
          <div className="vtm-memorize-container">
            <div
              className="vtm-countdown"
              style={{
                color: countdown > 3 ? '#22c55e' : countdown > 1 ? '#eab308' : '#ef4444',
                transition: 'color 0.4s ease'
              }}
            >
              {countdown}
            </div>
            <div className="vtm-sequence">
              {gameData.sequence.map((emoji, i) => (
                <div key={i} className="vtm-item vtm-item-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                  {emoji}
                </div>
              ))}
              {gameData.fakeFlash && countdown === 4 && (
                <div className="vtm-item vtm-item-fake-flash">{gameData.fakeFlash}</div>
              )}
            </div>
          </div>
        )}

        {(phase === 'question' || phase === 'feedback') && (
          <div className="vtm-question-container">
            <h2 className="vtm-question-text">{gameData.question}</h2>
            {phase === 'question' && (() => {
              const pct = (timeLeft / roundTimeLimit) * 100;
              const color = timeLeft > 4 ? '#22c55e' : timeLeft > 2 ? '#eab308' : '#ef4444';
              return (
                <div className="vtm-q-timer-container">
                  <div
                    className={`vtm-q-timer-bar ${timeLeft <= 2 ? 'vtm-timer-pulse' : ''}`}
                    style={{ width: `${pct}%`, background: color, transition: 'width 0.1s linear, background 0.4s ease' }}
                  />
                  <span className="vtm-timer-label" style={{ color }}>{Math.ceil(timeLeft)}s</span>
                </div>
              );
            })()}
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
