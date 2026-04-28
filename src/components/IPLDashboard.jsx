import React, { useState, useEffect } from 'react';
import { TEAM_INFO, IPL_2025_MATCHES, IPL_2025_POINTS } from '../data/iplSchedule';

/* ── Prediction Mini-Quiz for a match ── */
function MatchPredictor({ match, onClose }) {
  const home = TEAM_INFO[match.home];
  const away = TEAM_INFO[match.away];
  const [prediction, setPrediction] = useState(null);
  const [scoreRange, setScoreRange] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const scoreRanges = ['140–159', '160–179', '180–199', '200+'];

  const handleSubmit = () => {
    if (prediction && scoreRange) setSubmitted(true);
  };

  return (
    <div className="ipl-predictor-overlay" onClick={onClose}>
      <div className="ipl-predictor-modal" onClick={e => e.stopPropagation()}>
        <button className="ipl-predictor-close" onClick={onClose}>✕</button>

        <div className="ipl-predictor-header">
          <span style={{ color: home.color, fontWeight: 800 }}>{match.home}</span>
          <span className="ipl-predictor-vs">vs</span>
          <span style={{ color: away.color, fontWeight: 800 }}>{match.away}</span>
        </div>
        <p className="ipl-predictor-date">{match.date} · {match.time} · {match.venue}</p>

        {!submitted ? (
          <>
            <div className="ipl-predictor-section">
              <p className="ipl-predictor-q">🏆 Who will win?</p>
              <div className="ipl-predictor-choices">
                <button
                  className={`ipl-pred-btn ${prediction === match.home ? 'ipl-pred-btn--selected' : ''}`}
                  style={{ '--pc': home.color }}
                  onClick={() => setPrediction(match.home)}
                >
                  {home.flag} {match.home}
                </button>
                <button
                  className={`ipl-pred-btn ${prediction === match.away ? 'ipl-pred-btn--selected' : ''}`}
                  style={{ '--pc': away.color }}
                  onClick={() => setPrediction(match.away)}
                >
                  {away.flag} {match.away}
                </button>
              </div>
            </div>

            <div className="ipl-predictor-section">
              <p className="ipl-predictor-q">📊 Predict first innings score</p>
              <div className="ipl-predictor-ranges">
                {scoreRanges.map(r => (
                  <button
                    key={r}
                    className={`ipl-range-btn ${scoreRange === r ? 'ipl-range-btn--selected' : ''}`}
                    onClick={() => setScoreRange(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`ipl-pred-submit ${!prediction || !scoreRange ? 'ipl-pred-submit--disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!prediction || !scoreRange}
            >
              Lock In Prediction 🔒
            </button>
          </>
        ) : (
          <div className="ipl-pred-result">
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎯</div>
            <h3 className="ipl-pred-result-title">Prediction Locked!</h3>
            <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.95rem' }}>
              You predicted <strong style={{ color: TEAM_INFO[prediction]?.color }}>{prediction}</strong> to win
              with a score in the <strong style={{ color: '#f97316' }}>{scoreRange}</strong> range.
            </p>
            <p style={{ color: '#64748b', marginTop: '16px', fontSize: '0.8rem' }}>
              Come back after the match to see if you were right! 🏏
            </p>
            <button className="ipl-pred-submit" style={{ marginTop: '24px' }} onClick={onClose}>
              Done ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single Match Card ── */
function MatchCard({ match, onPredict }) {
  const home = TEAM_INFO[match.home];
  const away = TEAM_INFO[match.away];
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';

  return (
    <div
      className={`ipl-match-card ${isLive ? 'ipl-match-card--live' : ''} ${isCompleted ? 'ipl-match-card--completed' : ''}`}
      onClick={() => !isCompleted && onPredict(match)}
    >
      {/* Status badge */}
      <div className="ipl-match-status-row">
        {isLive && <span className="ipl-badge-live"><span className="ipl-live-dot" />LIVE</span>}
        {isUpcoming && <span className="ipl-badge-upcoming">🗓 UPCOMING</span>}
        {isCompleted && <span className="ipl-badge-completed">✓ COMPLETED</span>}
        <span className="ipl-match-date">{match.date} · {match.time}</span>
      </div>

      {/* Teams */}
      <div className="ipl-match-teams">
        <div className="ipl-match-team">
          <span className="ipl-team-flag" style={{ filter: `drop-shadow(0 0 8px ${home.color})` }}>
            {home.flag}
          </span>
          <span className="ipl-team-short" style={{ color: home.color }}>{match.home}</span>
          {isCompleted && (
            <span className="ipl-match-score">{match.score?.home}</span>
          )}
          {isLive && match.liveScore && (
            <span className="ipl-match-score ipl-live-score">{match.liveScore.home}</span>
          )}
          {isCompleted && match.winner === match.home && (
            <span className="ipl-winner-chip" style={{ background: home.color }}>WON</span>
          )}
        </div>

        <div className="ipl-vs-divider">
          <span className="ipl-vs-text">VS</span>
          {isLive && <span className="ipl-vs-live-ring" />}
        </div>

        <div className="ipl-match-team ipl-match-team--away">
          <span className="ipl-team-flag" style={{ filter: `drop-shadow(0 0 8px ${away.color})` }}>
            {away.flag}
          </span>
          <span className="ipl-team-short" style={{ color: away.color }}>{match.away}</span>
          {isCompleted && (
            <span className="ipl-match-score">{match.score?.away}</span>
          )}
          {isLive && match.liveScore && (
            <span className="ipl-match-score ipl-live-score">{match.liveScore.away}</span>
          )}
          {isCompleted && match.winner === match.away && (
            <span className="ipl-winner-chip" style={{ background: away.color }}>WON</span>
          )}
        </div>
      </div>

      {/* Venue */}
      <p className="ipl-match-venue">📍 {match.venue}</p>

      {/* CTA for upcoming */}
      {isUpcoming && (
        <div className="ipl-match-predict-cta">Predict Winner 🎯</div>
      )}
      {isLive && (
        <div className="ipl-match-predict-cta ipl-match-predict-cta--live">Predict Now 🔥</div>
      )}
    </div>
  );
}

/* ── Points Table ── */
function PointsTable() {
  return (
    <div className="ipl-points-table">
      <h3 className="ipl-section-title">📋 Points Table — IPL 2025</h3>
      <table className="ipl-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>Pts</th>
            <th>NRR</th>
          </tr>
        </thead>
        <tbody>
          {IPL_2025_POINTS.map((row, i) => {
            const t = TEAM_INFO[row.team];
            return (
              <tr key={row.team} className={i < 4 ? 'ipl-table-row--playoff' : ''}>
                <td className="ipl-table-pos">{i + 1}</td>
                <td>
                  <span className="ipl-table-team">
                    <span className="ipl-table-dot" style={{ background: t.color }} />
                    {row.team}
                  </span>
                </td>
                <td>{row.p}</td>
                <td><strong>{row.w}</strong></td>
                <td>{row.l}</td>
                <td><strong style={{ color: t.color }}>{row.pts}</strong></td>
                <td className={parseFloat(row.nrr) > 0 ? 'ipl-nrr-pos' : 'ipl-nrr-neg'}>{row.nrr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="ipl-table-note">🟢 Top 4 qualify for playoffs</p>
    </div>
  );
}

/* ── Main IPL Dashboard ── */
export default function IPLDashboard({ onBack }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'live' | 'upcoming' | 'completed'
  const [tab, setTab] = useState('matches'); // 'matches' | 'points'
  const [predictMatch, setPredictMatch] = useState(null);
  const [liveTime, setLiveTime] = useState(new Date());


  // Tick clock for live match feel
  useEffect(() => {
    const id = setInterval(() => setLiveTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const filtered = filter === 'all'
    ? IPL_2025_MATCHES
    : IPL_2025_MATCHES.filter(m => m.status === filter);

  const liveCount = IPL_2025_MATCHES.filter(m => m.status === 'live').length;

  return (
    <div className="ipl-dashboard">
      {/* ── Stadium ambient ── */}
      <div className="ipl-stadium-glow" />
      <div className="ipl-stadium-glow ipl-stadium-glow--2" />

      {/* ── Header ── */}
      <div className="ipl-dash-header">
        <button className="back-btn" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
          ← Back
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="ipl-dash-title-badge">🏏 IPL 2025 · LIVE DASHBOARD</div>
          <h2 className="ipl-dash-title">Indian Premier League</h2>
          <p className="ipl-dash-subtitle">Season 18 · Ongoing</p>
        </div>
        <div style={{ width: '80px' }} /> {/* spacer */}
      </div>

      {/* ── Tab switcher ── */}
      <div className="ipl-tab-row">
        <button
          className={`ipl-tab-btn ${tab === 'matches' ? 'ipl-tab-btn--active' : ''}`}
          onClick={() => setTab('matches')}
        >
          📅 Matches
        </button>
        <button
          className={`ipl-tab-btn ${tab === 'points' ? 'ipl-tab-btn--active' : ''}`}
          onClick={() => setTab('points')}
        >
          📋 Points Table
        </button>
      </div>

      {tab === 'matches' && (
        <>
          {/* ── Filter pills ── */}
          <div className="ipl-filter-row">
            {[
              { key: 'all', label: 'All Matches' },
              { key: 'live', label: `🔴 Live${liveCount ? ` (${liveCount})` : ''}` },
              { key: 'upcoming', label: '🗓 Upcoming' },
              { key: 'completed', label: '✓ Results' },
            ].map(f => (
              <button
                key={f.key}
                className={`ipl-filter-pill ${filter === f.key ? 'ipl-filter-pill--active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* ── Matches grid ── */}
          <div className="ipl-matches-grid">
            {filtered.length === 0
              ? <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No matches in this view.</p>
              : filtered.map(m => (
                <MatchCard key={m.id} match={m} onPredict={setPredictMatch} />
              ))
            }
          </div>
        </>
      )}

      {tab === 'points' && <PointsTable />}

      {/* ── Predictor modal ── */}
      {predictMatch && (
        <MatchPredictor match={predictMatch} onClose={() => setPredictMatch(null)} />
      )}
    </div>
  );
}
