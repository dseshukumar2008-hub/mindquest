import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/audio';
import './LoginPage.css';

const AVATARS = [
  { id: 'wizard', emoji: '🧙', label: 'Wizard' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
];




function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);




  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('Please enter a player name to continue.'); return; }
    if (!avatarId) { setError('Select your identity before entering!'); return; }

    setError('');
    setIsSubmitting(true);
    setIsEntering(true);
    playSound('perfect');

    const chosen = AVATARS.find(a => a.id === avatarId);
    setTimeout(() => {
      if (isMounted.current) {
        onLogin({ username: username.trim(), avatar: chosen.emoji, avatarId });
      }
    }, 1500); // 1.5s cinematic delay
  };

  return (
    <div className="login-page">
      {/* Ambient background orbs — same as HomePage */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      {/* Ambient particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className={`login-particle login-particle-${i + 1}`} />
      ))}

            {isEntering && (
        <div className="login-overlay">
          <div className="login-overlay-content">
            <div className="login-overlay-icon">🎮</div>
            <h2 className="login-overlay-title">Initializing MindQuest...</h2>
            <p className="login-overlay-sub">Preparing your challenge...</p>
            <div className="login-progress-track">
              <div className="login-progress-fill"></div>
            </div>
          </div>
        </div>
      )}
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">🎮</span>
          <h1 className="login-title">MindQuest</h1>
          <p className="login-subtitle">Only the sharpest minds survive. Are you ready to enter the challenge?</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Username field */}
          <div className="login-field">
            <label className="login-label" htmlFor="mq-username">🎮 Enter Your Player Name</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">⚡</span>
              <input
                id="mq-username"
                className="login-input"
                type="text"
                placeholder="Enter your name…"
                maxLength={24}
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          {/* Avatar picker */}
          <div className="login-field">
            <label className="login-label">🧬 Select Your Identity</label>
            <div className="avatar-grid">
              {AVATARS.map(av => (
                <button
                  key={av.id}
                  type="button"
                  className={`avatar-card${avatarId === av.id ? ' avatar-card--selected' : ''}`}
                  onClick={() => { setAvatarId(av.id); setError(''); }}
                  aria-label={av.label}
                  aria-pressed={avatarId === av.id}
                >
                  <span className="avatar-emoji">{av.emoji}</span>
                  <span className="avatar-label">{av.label}</span>
                </button>
              ))}
            </div>
              <p className="avatar-subtitle">Your choice defines your journey.</p>
          </div>

          {/* Error */}
          {error && <p className="login-error" role="alert">{error}</p>}

          {/* Submit */}
          <button
            id="enter-mindquest-btn"
            type="submit"
            className={`login-submit${isSubmitting ? ' login-submit--loading' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="login-submit-inner">
                <span className="login-spinner" /> Entering…
              </span>
            ) : '🚀 Start Your Journey'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
