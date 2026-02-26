# Puzzle Quest — Product Spec

**A standalone offline puzzle game for kids**
**Version:** 1.0
**Target:** macOS (Safari/Chrome), MacBook Air

---

## 1. Overview

Puzzle Quest is a single-player offline puzzle game containing **Wordle** and **Mini Crossword**, styled after the NYT Games aesthetic. The player progresses through 100 puzzles of each type at their own pace, earns points based on performance, and spends points on cosmetic unlocks (themes and avatars). Difficulty adapts independently per game type based on recent performance.

### Constraints & Assumptions

| Constraint | Detail |
|---|---|
| Platform | Static build (React + Vite) → folder copied to MacBook Air, opened via `index.html` in browser |
| Internet | **None required.** All assets, word lists, and crossword data baked into the build |
| Auth | None. Single implicit player |
| Persistence | `localStorage` (survives browser restarts; clearing browser data resets progress) |
| Vocabulary | Grade 5 reading level (~10-11 year old), no adult/inappropriate words |
| Visual style | Clean, minimal, NYT Games-inspired (warm whites, serif headers, sharp grid lines) |

---

## 2. Information Architecture

```
┌─────────────────────────────────┐
│           HOME SCREEN           │
│                                 │
│  [Avatar]  Player Name          │
│  ⭐ 1,240 points                │
│                                 │
│  ┌───────────┐ ┌───────────┐   │
│  │  WORDLE   │ │ CROSSWORD │   │
│  │  Puzzle   │ │  Puzzle   │   │
│  │  34/100   │ │  28/100   │   │
│  │  ▸ Play   │ │  ▸ Play   │   │
│  └───────────┘ └───────────┘   │
│                                 │
│  [🏪 Shop]   [📊 Stats]        │
│                                 │
└─────────────────────────────────┘
```

### Screens

| Screen | Purpose |
|---|---|
| **Home** | Hub showing progress per game, total points, current avatar, entry to Shop and Stats |
| **Wordle Game** | The active Wordle puzzle |
| **Crossword Game** | The active Mini Crossword puzzle |
| **Shop** | Browse and purchase themes & avatars with points |
| **Stats** | Per-game stats: streak, best time, accuracy, difficulty history |
| **Puzzle Complete** | Post-game overlay: score breakdown, points earned, "Next Puzzle" / "Home" |
| **Settings** | Reset progress (with confirmation), change player name |

---

## 3. Game: Wordle

### Rules

- Standard 5-letter Wordle: guess a hidden word in **6 attempts**
- After each guess, tiles color-code:
  - 🟩 **Green** — correct letter, correct position
  - 🟨 **Yellow** — correct letter, wrong position
  - ⬜ **Gray** — letter not in word
- On-screen keyboard reflects letter states
- Guess must be a valid English word (validated against built-in dictionary)

### Puzzle Progression

- 100 pre-defined puzzles, numbered 1–100
- Player progresses sequentially (completes #34 → unlocks #35)
- **No going back** to replay completed puzzles (preserves integrity of points)

### Difficulty Tiers

| Tier | Label | Word Characteristics |
|---|---|---|
| 1 | Easy | Common, everyday words (e.g., HAPPY, CHAIR, LIGHT) — high frequency, no unusual letter combos |
| 2 | Medium | Moderately common words (e.g., GLOBE, CRANE, PLUMB) — some less-obvious letters |
| 3 | Hard | Less common / trickier words (e.g., KNELT, GLYPH, DWARF) — double letters, uncommon combos |

Each puzzle is tagged with a difficulty tier. The sequence starts at Tier 1 and adapts (see §6).

### Scoring

| Factor | Points |
|---|---|
| Solved in 1 guess | 100 |
| Solved in 2 guesses | 80 |
| Solved in 3 guesses | 60 |
| Solved in 4 guesses | 40 |
| Solved in 5 guesses | 25 |
| Solved in 6 guesses | 15 |
| Failed (didn't solve) | 0 |
| **Streak bonus** | +5 per consecutive solve (capped at +50) |
| **Difficulty multiplier** | Tier 1: ×1.0 · Tier 2: ×1.5 · Tier 3: ×2.0 |

**Formula:** `finalScore = floor(basePoints × difficultyMultiplier) + streakBonus`

**Example:** Solved in 3 guesses on Tier 2 with a 4-puzzle streak → `floor(60 × 1.5) + 20 = 110 points`

---

## 4. Game: Mini Crossword

### Rules

- **5×5 grid** with clues for Across and Down
- Player taps a cell, types a letter; tap clue to highlight the word
- Auto-advance to next cell in the active word direction
- Backspace clears current cell and moves back
- When a word is fully filled and correct, it locks in (turns green)
- Puzzle is complete when all words are correctly filled

### Puzzle Progression

- 100 pre-generated crossword puzzles, numbered 1–100
- Sequential progression (same as Wordle)

### Difficulty Tiers

| Tier | Label | Characteristics |
|---|---|---|
| 1 | Easy | Common words, straightforward definitional clues (e.g., "Opposite of cold" → HOT) |
| 2 | Medium | Slightly harder vocab, clues require inference (e.g., "You might skip one" → STONE, MEAL) |
| 3 | Hard | Trickier vocab, wordplay in clues, more crossing constraints |

### Grid Generation Strategy

All 100 crosswords are **pre-generated and baked into the build** as JSON. Each puzzle contains:

```json
{
  "id": 42,
  "difficulty": 2,
  "grid": [
    ["S","T","A","R","S"],
    ["H","#","R","#","E"],
    ["A","D","E","A","L"],
    ["R","#","A","#","F"],
    ["P","L","A","N","S"]
  ],
  "clues": {
    "across": [
      { "number": 1, "row": 0, "col": 0, "clue": "Twinkling night lights", "answer": "STARS" },
      { "number": 3, "row": 2, "col": 0, "clue": "A great bargain", "answer": "ADEAL" }
    ],
    "down": [
      { "number": 1, "row": 0, "col": 0, "clue": "Pointed and quick-witted", "answer": "SHARP" }
    ]
  }
}
```

`#` = black/blocked cell.

### Scoring

| Factor | Points |
|---|---|
| Completed with 0 errors | 100 |
| Completed with 1–2 errors | 70 |
| Completed with 3–5 errors | 40 |
| Completed with 6+ errors | 20 |
| **Time bonus** | Under 2 min: +30 · Under 5 min: +15 · Under 10 min: +5 |
| **No-hint bonus** | +20 (if hints are never used) |
| **Streak bonus** | +5 per consecutive complete (capped at +50) |
| **Difficulty multiplier** | Tier 1: ×1.0 · Tier 2: ×1.5 · Tier 3: ×2.0 |

**Error tracking:** An "error" is counted when the player submits/enters a wrong letter that gets corrected. Overwriting a cell with a different letter before moving on does NOT count as an error (only the final per-cell submission counts — i.e., when the cursor leaves the cell or the word is checked).

### Hint System

- Player can tap **"Reveal Letter"** to fill one correct letter in the currently selected cell
- Costs: first hint is free; subsequent hints cost **10 points each** from the player's bank
- Using any hint forfeits the no-hint bonus (+20)

---

## 5. Points Economy & Shop

### Earning Points

Only source of points: completing puzzles (Wordle + Crossword scoring above).

**Estimated earning rate:** ~60–120 points per puzzle → ~12,000–24,000 total points across all 200 puzzles.

### Shop Items

#### Themes

Themes change background colors, tile colors, font accents, and grid styling.

| Theme | Cost | Description |
|---|---|---|
| Classic (default) | Free | NYT-style warm white, dark text, green/yellow tiles |
| Ocean | 200 | Soft blues, teal accents, wave-inspired tile animations |
| Sunset | 200 | Warm oranges and pinks, golden highlights |
| Forest | 300 | Deep greens, earthy browns, leaf motifs |
| Galaxy | 500 | Dark mode, purple/blue gradients, star particle effects |
| Candy | 500 | Pastel pinks, purples, playful rounded tiles |
| Retro | 800 | Pixel-art style, 8-bit color palette, chunky fonts |
| Rainbow | 1000 | Animated color cycling on solved tiles |

#### Avatars

Displayed on the home screen and stats page.

| Avatar | Cost | Description |
|---|---|---|
| 😊 Smiley (default) | Free | Simple smiley face |
| 🦊 Fox | 150 | |
| 🐱 Cat | 150 | |
| 🦉 Owl | 200 | |
| 🦋 Butterfly | 200 | |
| 🐬 Dolphin | 300 | |
| 🦄 Unicorn | 500 | |
| 🐉 Dragon | 800 | |
| 🏆 Trophy | 1500 | Unlocks only after completing all 100 of either game |
| 👑 Crown | 3000 | Unlocks only after completing all 200 puzzles |

### Purchase Flow

1. Player taps item in shop → sees cost and current balance
2. If sufficient points → "Buy" button active → confirm → deducted → item equipped immediately
3. If insufficient → "Need X more points" shown, button disabled
4. Purchased items persist forever; player can switch between owned themes/avatars anytime

---

## 6. Adaptive Difficulty

Difficulty adjusts **independently** for Wordle and Crossword.

### Algorithm

Maintain a rolling window of the **last 5 completed puzzles** per game type.

```
performance_score = average of last 5 puzzle scores (normalized to 0–100)
```

| Performance Score | Action |
|---|---|
| ≥ 75 | Promote: next puzzle is one tier higher (cap at Tier 3) |
| 40–74 | Stay: next puzzle is same tier |
| < 40 | Demote: next puzzle is one tier lower (floor at Tier 1) |

### Implementation Detail

- Each of the 100 puzzles per game has **3 variants** (one per tier) pre-generated in the data
- When the player reaches puzzle N, the system selects the variant matching their current tier
- This means the data file contains **300 Wordle words** (100 × 3 tiers) and **300 crossword grids** (100 × 3 tiers)
- The player's current tier per game is stored in localStorage

### Edge Cases

- First 3 puzzles always start at Tier 1 (warm-up period, not enough data for rolling average)
- If a player fails a Tier 1 puzzle, they stay at Tier 1 (can't go lower)
- Tier changes are shown to the player via a subtle toast: "Difficulty increased! ⬆️" / "Difficulty adjusted ⬇️"

---

## 7. Stats Screen

### Per-Game Stats

| Stat | Detail |
|---|---|
| Puzzles Completed | e.g., 34/100 |
| Current Streak | Consecutive solves |
| Best Streak | All-time longest streak |
| Current Difficulty | Tier 1/2/3 with label |
| Average Score | Mean points per puzzle |
| Guess Distribution (Wordle) | Bar chart: how many times solved in 1, 2, 3, 4, 5, 6 guesses, or failed |
| Average Time (Crossword) | Mean completion time |
| Total Points Earned | From this game type |

### Global Stats

| Stat | Detail |
|---|---|
| Total Points | Earned across both games |
| Points Spent | In shop |
| Points Balance | Current spendable |
| Items Owned | Count of themes + avatars |
| Overall Completion | X/200 puzzles |

---

## 8. Data Architecture

### localStorage Schema

```json
{
  "pq_player": {
    "name": "Player",
    "createdAt": "2026-02-26T00:00:00Z"
  },
  "pq_points": {
    "earned": 3400,
    "spent": 700,
    "balance": 2700
  },
  "pq_wordle": {
    "currentPuzzle": 35,
    "currentTier": 2,
    "streak": 4,
    "bestStreak": 12,
    "history": [
      { "puzzle": 34, "tier": 2, "guesses": 3, "score": 110, "solved": true },
      ...
    ]
  },
  "pq_crossword": {
    "currentPuzzle": 28,
    "currentTier": 1,
    "streak": 3,
    "bestStreak": 8,
    "history": [
      { "puzzle": 27, "tier": 1, "errors": 1, "timeSeconds": 185, "hintsUsed": 0, "score": 127, "completed": true },
      ...
    ]
  },
  "pq_shop": {
    "ownedThemes": ["classic", "ocean"],
    "ownedAvatars": ["smiley", "fox"],
    "activeTheme": "ocean",
    "activeAvatar": "fox"
  },
  "pq_settings": {
    "soundEnabled": true
  }
}
```

### Static Data Files (bundled in build)

| File | Content | Approx Size |
|---|---|---|
| `wordle-words.json` | 300 words (100 puzzles × 3 tiers) + valid guess dictionary (~8,000 words) | ~100 KB |
| `crosswords.json` | 300 crossword grids with clues (100 puzzles × 3 tiers) | ~300 KB |
| `shop-items.json` | Theme definitions (CSS variables) and avatar metadata | ~5 KB |

**Total bundle estimate:** ~2–3 MB including React runtime, styles, and all game data.

---

## 9. UI/UX Design Notes

### Visual Language (NYT Games-inspired)

| Element | Style |
|---|---|
| Background | `#F6F6F2` (warm off-white) |
| Primary text | `#1A1A1A` (near-black) |
| Headers | Serif font (e.g., `Georgia` or system serif) |
| Body text | Sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI"`) |
| Tile (correct) | `#6AAA64` (green) |
| Tile (present) | `#C9B458` (yellow/gold) |
| Tile (absent) | `#787C7E` (gray) |
| Tile (empty) | `#FFFFFF` with `1px solid #D3D6DA` border |
| Grid lines | `#D3D6DA` |
| Accent / CTA | `#1A1A1A` (black buttons, white text) |
| Cards | White with subtle `box-shadow`, `8px` border-radius |

### Animations

- **Tile flip** on Wordle guess reveal (CSS 3D transform, 300ms per tile, staggered)
- **Tile pop** on letter entry (subtle scale 1.0 → 1.1 → 1.0, 100ms)
- **Shake** on invalid word (horizontal shake, 300ms)
- **Bounce** on puzzle completion (tiles bounce sequentially)
- **Confetti** on milestone completions (every 10th puzzle, tier promotion)
- All animations are CSS-only (no animation libraries needed)

### Responsive Behavior

- Designed for **1024px+ width** (MacBook Air screen)
- Game grids centered, max-width `500px`
- On-screen keyboard for Wordle: full QWERTY layout, ~40px key height
- Crossword: clickable cells, arrow keys for navigation

### Sound (Optional)

- Subtle key click on letter entry
- Correct/wrong feedback tones
- Toggle in settings (default: on)
- Implemented via Web Audio API (no external files needed, synthesized tones)

---

## 10. Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | CSS Modules or Tailwind (utility-first, tree-shaken) |
| State Management | React Context + `useReducer` (simple enough, no Redux needed) |
| Storage | `localStorage` with JSON serialization |
| Build Output | Static `dist/` folder → copy to MacBook |

### Project Structure

```
puzzle-quest/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Layout/           # Header, Navigation, Shell
│   │   ├── Home/             # HomeScreen, GameCard, PointsDisplay
│   │   ├── Wordle/           # WordleGame, Tile, Keyboard, Row
│   │   ├── Crossword/        # CrosswordGame, Grid, ClueList, Cell
│   │   ├── Shop/             # ShopScreen, ThemeCard, AvatarCard
│   │   ├── Stats/            # StatsScreen, GuessDistChart, StreakDisplay
│   │   └── shared/           # Modal, Toast, Button, ConfettiEffect
│   ├── data/
│   │   ├── wordle-words.json
│   │   ├── crosswords.json
│   │   └── shop-items.json
│   ├── hooks/
│   │   ├── useWordle.ts      # Wordle game logic
│   │   ├── useCrossword.ts   # Crossword game logic
│   │   ├── useStorage.ts     # localStorage wrapper with type safety
│   │   └── useDifficulty.ts  # Adaptive difficulty calculator
│   ├── context/
│   │   ├── GameContext.tsx    # Global game state provider
│   │   └── ThemeContext.tsx   # Active theme provider
│   ├── types/
│   │   └── index.ts          # All TypeScript interfaces
│   ├── utils/
│   │   ├── scoring.ts        # Score calculation functions
│   │   ├── difficulty.ts     # Tier promotion/demotion logic
│   │   └── audio.ts          # Web Audio API sound synth
│   └── styles/
│       ├── themes/           # CSS variable sets per theme
│       └── global.css
├── scripts/
│   └── generate-puzzles.ts   # One-time script to generate puzzle data (uses AI API)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Build & Deploy

```bash
# Development
npm install
npm run dev          # localhost:5173

# Production build
npm run build        # outputs to dist/

# Deploy = copy dist/ folder to kid's laptop
# Open dist/index.html in Safari or Chrome
```

### Vite Config Notes

```typescript
// vite.config.ts
export default defineConfig({
  base: './',          // Relative paths so it works from file://
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,  // Don't inline assets as base64
  }
})
```

> ⚠️ **Critical:** `base: './'` ensures all asset paths are relative, which is required for the app to work when opened via `file://` protocol (double-clicking `index.html`).

---

## 11. Puzzle Data Generation (Build-time)

A **one-time script** (`scripts/generate-puzzles.ts`) generates all puzzle data before the build:

### Wordle Words

1. Start with a curated Grade 5-appropriate 5-letter word list (~2,000 words)
2. Categorize into 3 tiers based on word frequency data
3. Randomly select 100 words per tier (300 total)
4. Assign to puzzle slots: puzzle 1 gets words [tier1_word_1, tier2_word_1, tier3_word_1]
5. Also bundle a ~8,000-word valid guess dictionary (for input validation)

### Crossword Puzzles

1. Use Claude API (at build time only) to generate 300 mini crossword puzzles
2. Prompt template per puzzle:
   - Input: difficulty tier + puzzle number + previously used words (for uniqueness)
   - Output: 5×5 grid + across/down clues
3. Validate each grid: all words valid, clues age-appropriate, no duplicates across puzzles at same tier
4. Output: `crosswords.json`

> This script runs **once on the dev machine** (requires internet + API key). The output JSON is committed to the repo and bundled into the static build. The kid's laptop never needs internet.

---

## 12. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| localStorage cleared | All progress lost. Show "Welcome" screen as if new player. Consider a "backup/export" feature (JSON download) in v2. |
| Browser crash mid-puzzle | Wordle: save in-progress guesses to localStorage after each guess. Crossword: save grid state every 10 seconds. On reload, resume where left off. |
| All 100 puzzles completed | Show completion banner 🎉. "You've completed all [Game] puzzles! Stay tuned for more." Disable the play button. |
| Points go negative (edge case from hint spending) | Floor at 0. Prevent hint purchase if balance < cost. |
| Invalid word typed in Wordle | Shake animation + "Not in word list" toast. Don't consume a guess. |
| Opening in non-supported browser | Show fallback message. Target: Safari 15+, Chrome 90+. |

---

## 13. Future Enhancements (v2 Ideas)

- **Export/Import progress** — JSON download/upload as backup
- **Daily challenge mode** — 1 bonus puzzle per day (date-locked) with bonus points
- **Multiplayer** — local pass-and-play mode
- **More games** — Spelling Bee, Connections, Sudoku
- **Achievement badges** — "Perfect Score", "10 Streak", "Speed Demon"
- **Puzzle editor** — parent can add custom puzzles
- **More puzzles** — expand from 100 to 365 per game

---

## 14. Development Phases

| Phase | Scope | Effort Estimate |
|---|---|---|
| **Phase 1: Core Games** | Wordle + Crossword gameplay, basic scoring, sequential progression, minimal UI | ~3–4 days |
| **Phase 2: Polish** | Animations, themes system, adaptive difficulty, stats screen | ~2–3 days |
| **Phase 3: Shop & Economy** | Points shop, avatar system, theme switching | ~1–2 days |
| **Phase 4: Data** | Generate all 300 Wordle words + 300 crossword puzzles, validate quality | ~1–2 days |
| **Phase 5: QA & Deploy** | Test on Safari (MacBook Air), edge cases, build & copy to target machine | ~1 day |

**Total: ~8–12 days** (solo developer pace)

---

## 15. Decisions

| # | Question | Options | Recommendation |
|---|---|---|---|
| 1 | Player name — editable or fixed? | A) Ask on first launch B) Default to "Player", editable in settings | **A** |
| 2 | Can she replay completed puzzles for fun (no points)? | A) No replay B) Replay allowed, 0 points | **B** — more fun, no economy harm |
| 3 | Should wrong crossword letters be shown in red immediately? | A) Instant feedback B) Check only when word is complete C) Manual "check" button | **A** — better for learning at age 11 |
| 4 | Sound effects — include or skip for v1? | A) Include (Web Audio) B) Skip, add later | **B** — skip for v1, focus on gameplay |
| 5 | Tailwind vs CSS Modules? | A) Tailwind B) CSS Modules | **A** — faster to build, theme-friendly with CSS vars |