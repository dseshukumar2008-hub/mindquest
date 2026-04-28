import React from 'react';
import './Navbar.css';

const THEME_META = {
  dark:  { icon: '🌙', label: 'Dark'  },
  neon:  { icon: '⚡', label: 'Neon'  },
  light: { icon: '☀️', label: 'Light' },
};

function Navbar({ user, onProfile, theme, cycleTheme }) {
  const meta = THEME_META[theme] || THEME_META.dark;

  return (
    <nav className="mq-navbar" role="navigation" aria-label="Main navigation">
      <div className="mq-navbar__inner">
        {/* Brand */}
        <div className="mq-navbar__brand">
          <span className="mq-navbar__brand-icon">🎮</span>
          <span className="mq-navbar__brand-name">MindQuest</span>
        </div>

        {/* Controls */}
        <div className="mq-navbar__controls">
          <button
            id="theme-toggle-btn"
            className="mq-theme-toggle"
            onClick={cycleTheme}
            aria-label={`Current theme: ${meta.label}. Click to change.`}
            title="Toggle theme"
          >
            <span className="mq-theme-toggle__icon">{meta.icon}</span>
            <span className="mq-theme-toggle__label">{meta.label}</span>
          </button>

          {user && (
            <button
              id="profile-btn"
              className="mq-navbar__avatar-btn"
              onClick={onProfile}
              aria-label={`${user.username}'s profile`}
              title="View profile"
            >
              <span className="mq-navbar__avatar-emoji">{user.avatar}</span>
              <span className="mq-navbar__username">{user.username}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
