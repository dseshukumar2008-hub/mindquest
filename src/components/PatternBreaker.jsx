import React, { useState, useEffect, useCallback, useRef } from 'react';
import './PatternBreaker.css';
import ExitConfirmModal from './ExitConfirmModal';

const MAX_ROUNDS = 10;

// Helper: Shuffle array
const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ── PATTERN GENERATORS ──
const GENERATORS = {
  arithmetic: (roundNum) => {
    const start = Math.floor(Math.random() * 20) + 1;
    const step = Math.floor(Math.random() * (roundNum > 5 ? 10 : 5)) + 2;
    const sequence = [start, start + step, start + step * 2, start + step * 3].map(String);
    const answer = String(start + step * 4);
    const fakes = [
      String(start + step * 4 - 1),
      String(start + step * 4 + 1),
      String(start + step * 4 + step - 1)
    ];
    return { sequence, answer, fakes, type: 'number' };
  },
  decreasing: (roundNum) => {
    const step = Math.floor(Math.random() * 5) + 2;
    const start = (step * 5) + Math.floor(Math.random() * 10);
    const sequence = [start, start - step, start - step * 2, start - step * 3].map(String);
    const answer = String(start - step * 4);
    const fakes = [String(start - step * 4 + 1), String(start - step * 4 - 1), String(start - step * 4 + step)];
    return { sequence, answer, fakes, type: 'number' };
  },
  geometric: (roundNum) => {
    const start = Math.floor(Math.random() * 3) + 1;
    const ratio = roundNum > 6 ? 3 : 2;
    const sequence = [start, start * ratio, start * Math.pow(ratio, 2), start * Math.pow(ratio, 3)].map(String);
    const answer = String(start * Math.pow(ratio, 4));
    const fakes = [
      String(start * Math.pow(ratio, 4) - ratio),
      String(start * Math.pow(ratio, 4) + ratio),
      String(start * Math.pow(ratio, 3) * (ratio + 1))
    ];
    return { sequence, answer, fakes, type: 'number' };
  },
  fibonacci: () => {
    let a = Math.floor(Math.random() * 5) + 1;
    let b = a + Math.floor(Math.random() * 5) + 1;
    const seq = [a, b];
    for (let i = 0; i < 2; i++) {
      const next = seq[seq.length - 1] + seq[seq.length - 2];
      seq.push(next);
    }
    const sequence = seq.map(String);
    const answer = String(seq[seq.length - 1] + seq[seq.length - 2]);
    const fakes = [String(parseInt(answer) + 1), String(parseInt(answer) - 1), String(parseInt(answer) + 2)];
    return { sequence, answer, fakes, type: 'number' };
  },
  powers: () => {
    const start = Math.floor(Math.random() * 5) + 1;
    const sequence = [Math.pow(start, 2), Math.pow(start + 1, 2), Math.pow(start + 2, 2), Math.pow(start + 3, 2)].map(String);
    const answer = String(Math.pow(start + 4, 2));
    const fakes = [String(Math.pow(start + 4, 2) - 1), String(Math.pow(start + 4, 2) + 1), String(Math.pow(start + 5, 2))];
    return { sequence, answer, fakes, type: 'number' };
  },
  alphabet: (roundNum) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const step = roundNum > 5 ? 2 : 1;
    const startIdx = Math.floor(Math.random() * (letters.length - (step * 5)));
    const sequence = [letters[startIdx], letters[startIdx + step], letters[startIdx + step * 2], letters[startIdx + step * 3]];
    const answer = letters[startIdx + step * 4];
    const fakes = [letters[startIdx + step * 4 - 1] || 'Z', letters[startIdx + step * 4 + 1] || 'A', letters[startIdx + step * 3 + 1]];
    return { sequence, answer, fakes, type: 'mixed' };
  },
  alternating: () => {
    const palette = ['▲', '■', '●', '★', '🔷', '🔺', '🔴', '🔵', '🟢', '🟡'];
    const idx1 = Math.floor(Math.random() * palette.length);
    let idx2 = Math.floor(Math.random() * palette.length);
    while (idx1 === idx2) idx2 = Math.floor(Math.random() * palette.length);

    const sequence = [palette[idx1], palette[idx2], palette[idx1], palette[idx2]];
    const answer = palette[idx1];
    const fakes = [palette[idx2], palette[(idx1 + 1) % palette.length], palette[(idx2 + 1) % palette.length]];
    return { sequence, answer, fakes, type: 'shape' };
  },
  mixed: (roundNum) => {
    // Round 8+ only: Combine Color + Shape
    const colors = ['🔴', '🔵', '🟢', '🟡'];
    const shapes = ['▲', '■', '●', '★'];
    const c1 = colors[Math.floor(Math.random() * colors.length)];
    const s1 = shapes[Math.floor(Math.random() * shapes.length)];
    const c2 = colors[(colors.indexOf(c1) + 1) % colors.length];
    const s2 = shapes[(shapes.indexOf(s1) + 1) % shapes.length];

    const sequence = [`${c1}${s1}`, `${c2}${s2}`, `${c1}${s1}`, `${c2}${s2}`];
    const answer = `${c1}${s1}`;
    const fakes = [`${c2}${s2}`, `${c1}${s2}`, `${c2}${s1}`];
    return { sequence, answer, fakes, type: 'mixed' };
  }
};

let lastType = null;

// Helper: Generate dynamic pattern question
const generatePatternQuestion = (roundNum) => {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const types = Object.keys(GENERATORS);
      let type;

      // Difficulty selection
      if (roundNum <= 3) {
        const easyTypes = ['arithmetic', 'alternating', 'alphabet'];
        type = easyTypes[Math.floor(Math.random() * easyTypes.length)];
      } else if (roundNum <= 7) {
        const medTypes = ['arithmetic', 'decreasing', 'geometric', 'alphabet', 'powers'];
        type = medTypes[Math.floor(Math.random() * medTypes.length)];
      } else {
        type = types[Math.floor(Math.random() * types.length)];
      }

      // Anti-repetition
      if (type === lastType) {
        attempts++;
        continue;
      }

      const question = GENERATORS[type](roundNum);

      // Final validation
      const options = shuffleArray([...new Set([question.answer, ...question.fakes])]);
      if (options.length < 4) {
        attempts++;
        continue;
      }

      lastType = type;
      return {
        sequence: question.sequence,
        answer: question.answer,
        options: options.slice(0, 4),
        type: question.type
      };
    } catch (e) {
      attempts++;
    }
  }

  // Absolute Failsafe
  return {
    sequence: ['2', '4', '6', '8'],
    answer: '10',
    options: ['9', '10', '11', '12'],
    type: 'number'
  };
};

const PatternBreaker = ({ onBack }) => {
  const [phase, setPhase] = useState('start'); // start | playing | gameover
  const [currentRound, setCurrentRound] = useState(1);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timer, setTimer] = useState(12);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); // null | true | false
  const [isPaused, setIsPaused] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const timerRef = useRef(null);
  const handleAnswerRef = useRef(null);

  // Scroll lock effect
  useEffect(() => {
    if (phase === 'playing' || phase === 'gameover') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [phase]);

  const startNewGame = () => {
    // Generate 10 unique questions for this session
    const newPool = Array.from({ length: MAX_ROUNDS }, (_, i) => generatePatternQuestion(i + 1));
    setSessionQuestions(newPool);

    setPhase('playing');
    setCurrentRound(1);
    setScore(0);
    setLives(3);
    setStreak(0);
    setBestStreak(0);
    resetRound(1);
  };

  const getRoundTimer = useCallback((roundNum) => {
    if (roundNum <= 3) return 12;
    if (roundNum <= 6) return 10;
    return 8;
  }, []);

  const resetRound = useCallback((roundNum) => {
    setTimer(getRoundTimer(roundNum));
    setSelectedIdx(null);
    setIsCorrect(null);
    setIsPaused(false);
  }, [getRoundTimer]);

  // Timer logic
  useEffect(() => {
    if (phase === 'playing' && !isPaused && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && phase === 'playing' && !isPaused) {
      // Use ref so we always call the latest handleAnswer (avoids stale closure)
      handleAnswerRef.current?.(null, -1);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, timer, isPaused]);

  const handleAnswer = (option, index) => {
    // Keep ref in sync so the timer effect always invokes the latest version
    // (assignment happens on every render before the effect fires)
    if (isPaused) return;
    setIsPaused(true);
    setSelectedIdx(index);

    const question = sessionQuestions[currentRound - 1];
    if (!question) return;

    const correct = option === question.answer;
    // Compute newLives synchronously to avoid stale-closure bug in setTimeout
    const newLives = correct ? lives : lives - 1;

    if (correct) {
      setIsCorrect(true);
      const timeBonus = timer * 2;
      const streakBonus = streak >= 5 ? 5 : streak >= 3 ? 3 : streak >= 2 ? 2 : 1;
      const points = (10 + timeBonus) * streakBonus;
      setScore(prev => prev + points);
      setStreak(prev => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setIsCorrect(false);
      setStreak(0);
      setLives(newLives);
    }

    setTimeout(() => {

      if (currentRound < MAX_ROUNDS && newLives > 0) {
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        resetRound(nextRound);
      } else {
        setPhase('gameover');
      }
    }, 1200);
  };
  // Sync ref after every render
  handleAnswerRef.current = handleAnswer;

  const getRank = (finalScore) => {
    if (finalScore > 800) return '🔥 Logic God';
    if (finalScore > 500) return '🥇 Pattern Master';
    if (finalScore > 250) return '🥈 Smart Thinker';
    return '🥉 Beginner';
  };

  if (phase === 'start') {
    return (
      <div className="pb-screen pb-screen--start">
        <div className="pb-start-card">
          <div className="pb-hero">
            <div className="pb-logo">🧩</div>
            <h1 className="pb-title">Pattern Breaker</h1>
            <p className="pb-tagline">Detect the logic. Complete the sequence.</p>
          </div>

          <div className="pb-rules">
            <div className="pb-rule-item"><span>⚡</span> 10 Rapid Logic Rounds</div>
            <div className="pb-rule-item"><span>🔥</span> Streak Multipliers (2x, 3x, 5x)</div>
            <div className="pb-rule-item"><span>⏱️</span> Harder rounds = Less time</div>
          </div>

          <div className="pb-start-actions">
            <button className="pb-btn pb-btn--primary" onClick={startNewGame}>Play</button>
            <button className="pb-btn pb-btn--secondary" onClick={onBack}>Back to Hub</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'gameover') {
    const rank = getRank(score);
    const accuracy = Math.round((score > 0 ? (currentRound / MAX_ROUNDS) * 100 : 0));

    return (
      <div className="pb-screen pb-screen--end">
        <div className="pb-result-wrapper">
          <div className="pb-result-card">
            <div className="pb-result-header">
              <span className="pb-rank-badge">{rank}</span>
              <h3 className="pb-status-title">MISSION COMPLETE</h3>
            </div>

            <div className="pb-score-hero">
              <span className="pb-label-small">FINAL SCORE</span>
              <div className="pb-score-value">{score}</div>
            </div>

            <div className="pb-stats-grid">
              <div className="pb-stat-box">
                <span className="pb-label-small">ACCURACY</span>
                <div className="pb-stat-val">{accuracy}%</div>
              </div>
              <div className="pb-stat-box">
                <span className="pb-label-small">STREAK</span>
                <div className="pb-stat-val">🔥 {bestStreak}</div>
              </div>
            </div>

            <div className="pb-actions">
              <button className="pb-btn pb-btn--primary" onClick={startNewGame}>Play Again</button>
              <button className="pb-btn pb-btn--secondary" onClick={onBack}>Back to Hub</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = sessionQuestions[currentRound - 1];

  if (!question) return null;

  return (
    <div className="pb-screen pb-screen--playing">
      {/* ── HUD ── */}
      <div className="pb-hud">
        <div className="pb-hud-left">
          <span className="pb-round-text">ROUND {currentRound} / {MAX_ROUNDS}</span>
          {streak >= 2 && <span className="pb-multiplier-tag">{streak >= 5 ? '5x' : streak >= 3 ? '3x' : '2x'} 🔥</span>}
        </div>

        <div className="pb-hud-center">
          <div className="pb-timer-outer">
            <div
              className={`pb-timer-inner ${timer < 4 ? 'pb-timer--danger' : ''}`}
              style={{ width: `${(timer / getRoundTimer(currentRound)) * 100}%` }}
            />
          </div>
        </div>

        <div className="pb-hud-right">
          <div className="pb-score-hud">
            <span className="pb-label-xs">SCORE</span>
            <span className="pb-score-hud-val">{score}</span>
          </div>
          <button className="pb-exit-mini" onClick={() => setShowExitModal(true)}>✕</button>
        </div>
      </div>

      {/* ── QUESTION AREA ── */}
      <div className="pb-question-area">
        <div className="pb-pattern-container">
          {question.sequence.map((item, i) => (
            <React.Fragment key={i}>
              <div className="pb-pattern-item">{item}</div>
              <div className="pb-pattern-arrow">→</div>
            </React.Fragment>
          ))}
          <div className="pb-pattern-item pb-pattern-target">?</div>
        </div>
      </div>

      {/* ── OPTIONS GRID ── */}
      <div className="pb-options-grid">
        {question.options.map((opt, idx) => {
          let btnClass = "pb-option-btn";
          if (selectedIdx === idx) {
            btnClass += isCorrect ? " pb-option--correct" : " pb-option--wrong";
          } else if (selectedIdx !== null) {
            btnClass += " pb-option--dimmed";
          }

          return (
            <button
              key={idx}
              className={btnClass}
              onClick={() => handleAnswer(opt, idx)}
              disabled={isPaused}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* ── LIVES ── */}
      <div className="pb-lives-bar">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`pb-heart ${i >= lives ? 'pb-heart--lost' : ''}`}>❤️</span>
        ))}
      </div>
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={onBack}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
};

export default PatternBreaker;
