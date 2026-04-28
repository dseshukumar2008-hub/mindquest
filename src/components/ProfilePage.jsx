import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import Navbar from './Navbar';

function ProfilePage({ user, onBack, onReset, onLogout, theme, cycleTheme }) {
  const [stats, setStats] = useState({ totalScore: 0, gamesPlayed: 0, bestScore: 0 });
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mq_stats');
    const best  = parseInt(localStorage.getItem('mindquest_high_score') || '0', 10);
    if (saved) {
      const parsed = JSON.parse(saved);
      setStats({ ...parsed, bestScore: Math.max(parsed.bestScore || 0, best) });
    } else {
      setStats(s => ({ ...s, bestScore: best }));
    }
  }, []);

  const handleReset = () => {
    if (!resetConfirm) { setResetConfirm(true); return; }
    onReset();
    setStats({ totalScore: 0, gamesPlayed: 0, bestScore: 0 });
    setResetConfirm(false);
  };

  const statCards = [
    { icon: '🏆', label: 'Best Score',    value: stats.bestScore   },
    { icon: '🎮', label: 'Games Played',  value: stats.gamesPlayed },
    { icon: '⭐', label: 'Total Score',   value: stats.totalScore  },
  ];

  return (
    <div className="profile-page">
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      <Navbar user={user} onProfile={() => {}} theme={theme} cycleTheme={cycleTheme} />

      <div className="profile-content">
        {/* Identity card */}
        <div className="profile-card">
          <div className="profile-avatar">{user?.avatar || '🎮'}</div>
          <h2 className="profile-username">{user?.username || 'Player'}</h2>
          <p className="profile-badge">MindQuest Player</p>

          {/* Stats grid */}
          <div className="profile-stats-grid">
            {statCards.map(s => (
              <div key={s.label} className="profile-stat-card">
                <span className="profile-stat-icon">{s.icon}</span>
                <span className="profile-stat-value">{s.value}</span>
                <span className="profile-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button
              id="logout-btn"
              className="logout-btn"
              onClick={onLogout}
            >
              🚪 Log Out
            </button>

            <div className="reset-wrapper">
              <button
                id="reset-progress-btn"
                className={`reset-btn${resetConfirm ? ' reset-btn--confirm' : ''}`}
                onClick={handleReset}
                onBlur={() => setResetConfirm(false)}
              >
                {resetConfirm ? '⚠️ Confirm Reset?' : '🗑️ Reset Progress'}
              </button>
              {resetConfirm && (
                <p className="reset-hint">Click again to permanently erase all stats.</p>
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <button className="back-btn profile-back-btn" onClick={onBack} id="profile-back-btn">
          ← Back to home page
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
