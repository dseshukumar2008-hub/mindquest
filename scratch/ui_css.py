import os

css_path = r"e:\mind quest\src\components\HomePage.css"

with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Check if overrides already exist
if "/* ── UI REFACTOR OVERRIDES ── */" not in css_content:
    overrides = """
/* ═══════════════════════════════════════════
   UI REFACTOR OVERRIDES
   ═══════════════════════════════════════════ */

/* ── 1. Global Container constraints ── */
.view, .quiz-result, .ipl-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* ── 2. Standardized Grids (Auto-fit Responsiveness) ── */
.card-grid, 
.quiz-category-grid, 
.quiz-difficulty-grid, 
.strategy-grid, 
.ipl-year-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
  gap: 24px !important;
  width: 100% !important;
  max-width: 1200px !important;
  margin: 0 auto !important;
  justify-content: center;
}

/* Specific override for IPL years which are smaller */
.ipl-year-grid {
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)) !important;
}

/* ── 3. Unified Card Design ── */
.game-card, 
.quiz-category-card, 
.quiz-difficulty-card, 
.strategy-card {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  border-radius: 16px !important;
  padding: 24px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

/* Clean Hover States */
.game-card:hover, 
.quiz-category-card:hover, 
.quiz-difficulty-card:hover, 
.strategy-card:hover {
  transform: translateY(-6px) scale(1.02) !important;
  /* Glow is handled by individual card background/border styles, but we unify the lift */
}

/* Push buttons to the bottom to ensure equal height alignment looks good */
.card-play-btn, 
.quiz-category-card > div:last-child {
  margin-top: auto !important;
}

/* ── 4. Standardized Vertical Spacing ── */
.hero-section {
  padding: 48px 20px 24px !important;
}

.section-heading {
  margin-top: 48px !important;
  margin-bottom: 16px !important;
  font-size: 1.1rem !important;
}

.section-tagline {
  margin-bottom: 48px !important;
  font-size: 1rem !important;
}

/* Header spacing adjustments inside quiz */
.quiz-result-title {
  margin-bottom: 16px !important;
}

.quiz-result-score {
  margin-bottom: 48px !important;
}

/* ── 5. Powerup Layout Refactor ── */
.quiz-powerups {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px !important;
  width: 100%;
  max-width: 600px;
}

/* Responsive tweaks for smaller screens */
@media (max-width: 720px) {
  .home-page {
    padding-top: 80px;
  }
  .card-grid, 
  .quiz-category-grid, 
  .quiz-difficulty-grid, 
  .strategy-grid {
    grid-template-columns: 1fr !important; /* Force 1 column on mobile to prevent squishing */
  }
}
"""
    css_content += overrides
    with open(css_path, "w", encoding="utf-8") as f:
        f.write(css_content)

