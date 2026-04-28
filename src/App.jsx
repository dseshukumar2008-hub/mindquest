import React, { useState, useEffect } from 'react';
import LoginPage   from './components/LoginPage';
import HomePage    from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import { useTheme } from './hooks/useTheme';
import './theme.css';

// Helper: read/write mq_stats
function getStats() {
  try { return JSON.parse(localStorage.getItem('mq_stats') || 'null'); } catch { return null; }
}
function saveStats(s) {
  localStorage.setItem('mq_stats', JSON.stringify(s));
}

function App() {
  const [user,   setUser]   = useState(null);
  const [screen, setScreen] = useState('init'); // init | login | home | profile
  const { theme, cycleTheme } = useTheme();

  // Bootstrap: check for existing user on mount
  useEffect(() => {
    const saved = localStorage.getItem('mq_user');
    if (saved) {
      setUser(JSON.parse(saved));
      setScreen('home');
    } else {
      setScreen('login');
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('mq_user', JSON.stringify(userData));
    setUser(userData);
    setScreen('home');
  };

  // Called by HomePage whenever a game session ends with a score
  const handleGameEnd = (score) => {
    const prev = getStats() || { totalScore: 0, gamesPlayed: 0, bestScore: 0 };
    saveStats({
      totalScore:  prev.totalScore  + score,
      gamesPlayed: prev.gamesPlayed + 1,
      bestScore:   Math.max(prev.bestScore, score),
    });
  };

  const handleReset = () => {
    localStorage.removeItem('mq_stats');
    localStorage.removeItem('mindquest_high_score');
  };

  const handleLogout = () => {
    localStorage.removeItem('mq_user');
    setUser(null);
    setScreen('login');
  };

  if (screen === 'init') return null; // brief flash prevention

  if (screen === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (screen === 'profile') {
    return (
      <ProfilePage
        user={user}
        onBack={() => setScreen('home')}
        onReset={handleReset}
        onLogout={handleLogout}
        theme={theme}
        cycleTheme={cycleTheme}
      />
    );
  }

  return (
    <HomePage
      user={user}
      onProfile={() => setScreen('profile')}
      onGameEnd={handleGameEnd}
      theme={theme}
      cycleTheme={cycleTheme}
    />
  );
}

export default App;
