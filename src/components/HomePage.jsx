import React, { useState, useCallback, useEffect, useRef } from 'react';
import './HomePage.css';
import GameCard from './GameCard';
import QuizGame from './QuizGame';
import MemoryMatrix from './MemoryMatrix';
import GameScreen from './GameScreen';
import ReflexRush from './ReflexRush';
import PerfectTiming from './PerfectTiming';
import OneWrongTile from './OneWrongTile';
import VisualTrapMemory from './VisualTrapMemory';
import TapPrecision from './TapPrecision';
import PatternBreaker from './PatternBreaker';
import Navbar from './Navbar';

const games = [
  {
    id: 1,
    icon: '🧠',
    title: 'MindQuest',
    description: 'Face the ultimate trivia survival protocol',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.0) 100%)',
    cta: 'Start Challenge'
  },
  {
    id: 2,
    icon: '🃏',
    title: 'Memory Matrix',
    description: 'Test your cognitive recall under intense pressure',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, rgba(56, 189, 248, 0.0) 100%)',
    cta: 'Test Recall'
  },
  {
    id: 3,
    icon: '⚡',
    title: 'Reflex Rush',
    description: 'Push your pure reaction time limits to the extreme',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.0) 100%)',
    cta: 'Boost Reflexes'
  },
  {
    id: 4,
    icon: '⏱️',
    title: 'Perfect Timing',
    description: 'Test your internal clock and focus precision',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.0) 100%)',
    cta: 'Start Timer'
  },
  {
    id: 5,
    icon: '👁️',
    title: 'One Wrong Tile',
    description: 'Spot the subtle difference in the grid',
    glowColor: 'rgba(244, 114, 182, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(244, 114, 182, 0.05) 0%, rgba(244, 114, 182, 0.0) 100%)',
    cta: 'Find the Flaw'
  },
  {
    id: 6,
    icon: '🪤',
    title: 'Visual Trap',
    description: 'Perceive the sequence, avoid the distraction',
    glowColor: 'rgba(192, 38, 211, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(192, 38, 211, 0.05) 0%, rgba(192, 38, 211, 0.0) 100%)',
    cta: 'Enter the Trap'
  },
  {
    id: 7,
    icon: '🎯',
    title: 'Tap Precision',
    description: 'Master the perfect timing and reflex',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.0) 100%)',
    cta: 'Lock On Target'
  },
  {
    id: 8,
    icon: '🧩',
    title: 'Pattern Breaker',
    description: 'Detect the logic, break the code',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    bgGradient: 'linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, rgba(56, 189, 248, 0.0) 100%)',
    cta: 'Break the Code'
  },
];

function HomePage({ user, onProfile, onGameEnd, theme, cycleTheme }) {
  const [screen, setScreen] = useState('menu');
  const [selectedGame, setSelectedGame] = useState(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('mindquest_high_score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, [screen]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handlePlay = useCallback((game) => {
    setSelectedGame(game);
    setScreen('loading');
    setTimeout(() => {
      if (isMounted.current) setScreen('playing');
    }, 1500);
  }, []);

  const handleBack = useCallback(() => {
    // Capture current high score as a proxy for last game score
    const currentBest = parseInt(localStorage.getItem('mindquest_high_score') || '0', 10);
    if (onGameEnd && currentBest > 0) onGameEnd(currentBest);
    setScreen('menu');
    setSelectedGame(null);
  }, [onGameEnd]);

  return (
    <div className="home-page">
      <Navbar user={user} onProfile={onProfile} theme={theme} cycleTheme={cycleTheme} />

      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* ── HERO & ARCADE LANDING ── */}
      <div className={`view ${screen === 'menu' ? 'view--active' : 'view--hidden'}`}>
        <div className="hero-section">
          <div className="hero-icon floating-icon">🕹️</div>
          <h1 className="hero-title glow-text">MindQuest</h1>
          <p className="hero-subtitle">The Ultimate Cognitive Arcade Protocol</p>
        </div>

        <div className="arcade-divider">
          <p className="section-heading">EXPLORE ARCADE</p>
          <p className="section-tagline">Select a challenge to begin calibration</p>
        </div>

        <div className="card-grid">
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              icon={game.icon}
              title={game.title}
              description={game.description}
              glowColor={game.glowColor}
              bgGradient={game.bgGradient}
              cta={game.cta}
              onPlay={() => handlePlay(game)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* ── LOADING ── */}
      <div className={`view ${screen === 'loading' ? 'view--active' : 'view--hidden'}`}>
        <div className="loading-icon">{selectedGame?.icon || '🎮'}</div>
        <p className="loading-text">Loading Challenge…</p>
        <div className="loading-bar">
          <div className="loading-bar__fill" />
        </div>
      </div>

      {/* ── PLAYING ── */}
      <div className={`view ${screen === 'playing' ? 'view--active' : 'view--hidden'}`}>
        {selectedGame?.id === 1 && <QuizGame onBack={handleBack} />}
        {selectedGame?.id === 2 && <MemoryMatrix onBack={handleBack} />}
        {selectedGame?.id === 3 && <ReflexRush onBack={handleBack} />}
        {selectedGame?.id === 4 && <PerfectTiming onBack={handleBack} />}
        {selectedGame?.id === 5 && <OneWrongTile onBack={handleBack} />}
        {selectedGame?.id === 6 && <VisualTrapMemory onBack={handleBack} />}
        {selectedGame?.id === 7 && <TapPrecision onBack={handleBack} />}
        {selectedGame?.id === 8 && <PatternBreaker onBack={handleBack} />}
        {selectedGame && ![1, 2, 3, 4, 5, 6, 7, 8].includes(selectedGame.id) && (
          <GameScreen game={selectedGame} onBack={handleBack} />
        )}
      </div>

    </div>
  );
}

export default HomePage;

