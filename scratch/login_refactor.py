import re
import os

jsx_path = r"e:\mind quest\src\components\LoginPage.jsx"
css_path = r"e:\mind quest\src\components\LoginPage.css"

with open(jsx_path, "r", encoding="utf-8") as f:
    jsx_content = f.read()

# Sound helper
sound_helper = """
const playEntrySound = () => {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.0);
  } catch (e) { }
};
"""

jsx_content = jsx_content.replace(
    "function LoginPage({ onLogin }) {",
    sound_helper + "\nfunction LoginPage({ onLogin }) {"
)

# State
jsx_content = jsx_content.replace(
    "const [isSubmitting, setIsSubmitting] = useState(false);",
    "const [isSubmitting, setIsSubmitting] = useState(false);\n  const [isEntering, setIsEntering] = useState(false);"
)

# handleSubmit
old_submit = """  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('Please enter a username to continue.'); return; }
    if (!avatarId) { setError('Pick an avatar to represent you!'); return; }

    setError('');
    setIsSubmitting(true);

    const chosen = AVATARS.find(a => a.id === avatarId);
    setTimeout(() => {
      onLogin({ username: username.trim(), avatar: chosen.emoji, avatarId });
    }, 600);
  };"""

new_submit = """  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) { setError('Please enter a player name to continue.'); return; }
    if (!avatarId) { setError('Select your identity before entering!'); return; }

    setError('');
    setIsSubmitting(true);
    setIsEntering(true);
    playEntrySound();

    const chosen = AVATARS.find(a => a.id === avatarId);
    setTimeout(() => {
      onLogin({ username: username.trim(), avatar: chosen.emoji, avatarId });
    }, 1500); // 1.5s cinematic delay
  };"""
jsx_content = jsx_content.replace(old_submit, new_submit)

# Texts
jsx_content = jsx_content.replace(
    "<p className=\"login-subtitle\">The ultimate knowledge challenge awaits</p>",
    "<p className=\"login-subtitle\">Only the sharpest minds survive. Are you ready to enter the challenge?</p>"
)

jsx_content = jsx_content.replace(
    "<label className=\"login-label\" htmlFor=\"mq-username\">Your Name</label>",
    "<label className=\"login-label\" htmlFor=\"mq-username\">🎮 Enter Your Player Name</label>"
)

jsx_content = jsx_content.replace(
    "<label className=\"login-label\">Choose Your Avatar</label>",
    "<label className=\"login-label\">🧬 Select Your Identity</label>"
)

# Under avatar grid
jsx_content = jsx_content.replace(
    "</div>\n          </div>\n\n          {/* Error */}",
    "</div>\n              <p className=\"avatar-subtitle\">Your choice defines your journey.</p>\n          </div>\n\n          {/* Error */}"
)

# Submit button text
jsx_content = jsx_content.replace(
    ") : 'Enter MindQuest →'}",
    ") : '🚀 Start Your Journey'}"
)

# Render Overlay
overlay_jsx = """      {isEntering && (
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
      )}"""

# Insert overlay before <div className="login-card">
jsx_content = jsx_content.replace(
    "<div className=\"login-card\">",
    overlay_jsx + "\n      <div className=\"login-card\">"
)

# Particles
particles = """      {/* Ambient particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className={`login-particle login-particle-${i + 1}`} />
      ))}"""
jsx_content = jsx_content.replace(
    "<div className=\"ambient-orb ambient-orb-3\" />",
    "<div className=\"ambient-orb ambient-orb-3\" />\n" + particles
)

with open(jsx_path, "w", encoding="utf-8") as f:
    f.write(jsx_content)

# Now CSS
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Add particle styles at the end
css_append = """
/* ── Cinematic Entry Overlay ── */
.login-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13, 13, 13, 0.95);
  backdrop-filter: blur(20px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlayFadeIn 0.3s ease forwards;
}
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.login-overlay-content {
  text-align: center;
  animation: slideUpFade 0.5s ease 0.2s both;
}

.login-overlay-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: pulseIcon 1s ease infinite alternate;
}
@keyframes pulseIcon {
  from { transform: scale(1); filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5)); }
  to { transform: scale(1.1); filter: drop-shadow(0 0 25px rgba(168, 85, 247, 1)); }
}

.login-overlay-title {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.login-overlay-sub {
  color: #94a3b8;
  font-size: 1.1rem;
  margin-bottom: 32px;
}

.login-progress-track {
  width: 100%;
  max-width: 300px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin: 0 auto;
  overflow: hidden;
}

.login-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #a855f7);
  border-radius: 3px;
  width: 0%;
  animation: fillProgress 1.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

@keyframes fillProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

/* ── Avatar Cinematic Styles ── */
.avatar-subtitle {
  font-size: 0.75rem;
  color: #a855f7;
  text-align: center;
  margin-top: 12px;
  font-style: italic;
  opacity: 0.8;
}

.avatar-card {
  position: relative;
  overflow: hidden;
}

.avatar-card--selected {
  border-color: #00e5be;
  box-shadow: 0 0 20px rgba(0, 229, 190, 0.4);
  animation: selectPulse 2s infinite alternate;
}

@keyframes selectPulse {
  from { box-shadow: 0 0 15px rgba(0, 229, 190, 0.3); }
  to { box-shadow: 0 0 30px rgba(0, 229, 190, 0.6); }
}

/* ── Input Cinematic Styles ── */
.login-input-wrap::after {
  content: '|';
  position: absolute;
  right: 15px;
  color: #a855f7;
  font-weight: 900;
  font-size: 1.2rem;
  animation: blinkCaret 1s step-end infinite;
  opacity: 0;
  pointer-events: none;
}
.login-input-wrap:focus-within::after {
  opacity: 1;
}
@keyframes blinkCaret {
  50% { opacity: 0; }
}

/* ── Particles ── */
.login-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(168, 85, 247, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(168, 85, 247, 1);
  pointer-events: none;
  animation: floatParticle linear infinite;
  z-index: 0;
}

@keyframes floatParticle {
  from { transform: translateY(100vh); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  to { transform: translateY(-10vh); opacity: 0; }
}

/* Dynamically generate some particle positions via nth-child roughly */
.login-particle:nth-child(even) { background: rgba(56, 189, 248, 0.8); box-shadow: 0 0 10px rgba(56, 189, 248, 1); }
"""

# Let's generate specific nth-childs for particles
for i in range(1, 16):
    left = (i * 27) % 100
    dur = 5 + (i % 5) * 2
    delay = (i % 7) * 1.5
    css_append += f".login-particle-{i} {{ left: {left}%; animation-duration: {dur}s; animation-delay: {delay}s; }}\n"

css_content += css_append

# Update button glow
css_content = css_content.replace(
    "box-shadow: 0 4px 22px rgba(168,85,247,0.45);",
    "box-shadow: 0 4px 22px rgba(168,85,247,0.45), 0 0 10px rgba(168,85,247,0.2) inset;"
)

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)

