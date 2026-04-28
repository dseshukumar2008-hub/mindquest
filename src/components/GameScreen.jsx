import React from 'react';
import QuizGame from './QuizGame';


function GameScreen({ game, onBack }) {
  // MindQuest → full quiz UI; others still show placeholder
  if (game.id === 1) {
    return <QuizGame onBack={onBack} />;
  }

  return (
    <div className="game-screen">
      <div className="game-screen-icon">{game.icon}</div>
      <h2 className="game-screen-title">Starting {game.title}…</h2>
      <p className="game-screen-desc">{game.description}</p>
      <p className="game-screen-desc" style={{ color: '#444', marginTop: 4 }}>
        Coming soon!
      </p>
      <button className="back-btn" onClick={onBack}>
        ← Back to Menu
      </button>
    </div>
  );
}

export default GameScreen;

