import React from 'react';

function GameCard({ icon, title, description, glowColor, bgGradient, onPlay, index, cta }) {
  return (
    <div
      className="game-card"
      style={{ 
        '--glow-color': glowColor, 
        background: bgGradient || 'rgba(255, 255, 255, 0.02)',
        animationDelay: `${0.05 + (index * 0.1)}s`
      }}
      onClick={onPlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPlay()}
    >
      {icon && <div className="card-icon">{icon}</div>}
      <h2 className="card-title">{title}</h2>
      <p className="card-desc">{description}</p>
      <button
        className="play-btn card-play-btn"
        style={{ '--btn-glow': glowColor }}
        onClick={(e) => { e.stopPropagation(); onPlay(); }}
      >
        {cta || 'Play'}
      </button>
    </div>
  );
}

export default GameCard;
