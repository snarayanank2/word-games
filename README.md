# Puzzle Quest

A standalone offline puzzle game for kids featuring **Wordle** and **Mini Crossword**, styled after the NYT Games aesthetic. 100 puzzles per game type, adaptive difficulty, a points economy, and a cosmetic shop — all in a single HTML file that runs without internet.

---

## Playing the Game

### Quickest way
**[https://snarayanank2.github.io/word-games/](https://snarayanank2.github.io/word-games/)** — open in any browser, no install needed.

### Build from source
```bash
npm install
npm run build
# Opens dist/index.html — copy anywhere and open in browser
```

### Development
```bash
npm run dev   # http://localhost:5173
```

> **Note:** The game uses `localStorage` for persistence. Clearing browser data resets all progress.

---

## Features

### Games
| Game | Details |
|---|---|
| **Wordle** | Guess a 5-letter word in 6 attempts. Tiles reveal green/yellow/gray feedback. 100 puzzles. |
| **Mini Crossword** | 5×5 grid with Across and Down clues. Auto-advances, locks correct words green. 100 puzzles. |

### Progression
- Puzzles are played sequentially (complete #1 → unlock #2)
- **Adaptive difficulty** — the game tracks your last 5 results and promotes/demotes between Tier 1 (Easy), Tier 2 (Medium), and Tier 3 (Hard)
- Completed puzzles can be replayed for fun (no points awarded on replay)

### Scoring

**Wordle**
| Result | Base Points |
|---|---|
| Solved in 1 guess | 100 |
| Solved in 2 guesses | 80 |
| Solved in 3 guesses | 60 |
| Solved in 4 guesses | 40 |
| Solved in 5 guesses | 25 |
| Solved in 6 guesses | 15 |
| Failed | 0 |

**Crossword**
| Errors | Base Points |
|---|---|
| 0 errors | 100 |
| 1–2 errors | 70 |
| 3–5 errors | 40 |
| 6+ errors | 20 |

Both games apply:
- **Streak bonus** — +5 per consecutive solve, capped at +50
- **Difficulty multiplier** — Tier 1 ×1.0 · Tier 2 ×1.5 · Tier 3 ×2.0

Crossword also adds:
- **Time bonus** — +30 (under 2 min) · +15 (under 5 min) · +5 (under 10 min)
- **No-hint bonus** — +20 if no hints used

### Crossword Hints
- **First hint is free** — reveals the correct letter in the selected cell
- Subsequent hints cost **10 points** each from your balance
- Using any hint forfeits the no-hint bonus

### Shop
Spend earned points on themes and avatars.

**Themes** (change colors, tile styles, and grid appearance)

| Theme | Cost |
|---|---|
| Classic | Free |
| Ocean | 200 |
| Sunset | 200 |
| Forest | 300 |
| Galaxy | 500 |
| Candy | 500 |
| Retro | 800 |
| Rainbow | 1,000 |

**Avatars** (displayed on the home screen)

| Avatar | Cost |
|---|---|
| 😊 Smiley | Free |
| 🦊 Fox | 150 |
| 🐱 Cat | 150 |
| 🦉 Owl | 200 |
| 🦋 Butterfly | 200 |
| 🐬 Dolphin | 300 |
| 🦄 Unicorn | 500 |
| 🐉 Dragon | 800 |
| 🏆 Trophy | 1,500 (complete all 100 Wordle puzzles) |
| 👑 Crown | 3,000 (complete all 200 puzzles) |

---

## Project Structure

```
puzzle-quest/
├── public/
├── src/
│   ├── App.tsx                      # Screen router
│   ├── components/
│   │   ├── Home/HomeScreen.tsx
│   │   ├── Wordle/                  # WordleGame, WordleGrid, WordleKeyboard
│   │   ├── Crossword/               # CrosswordGame, CrosswordGrid, ClueList
│   │   ├── Shop/ShopScreen.tsx
│   │   ├── Stats/StatsScreen.tsx
│   │   ├── Layout/Header.tsx
│   │   └── shared/                  # Modal, Toast, PuzzleComplete, ConfettiEffect, Settings, Onboarding
│   ├── context/
│   │   ├── GameContext.tsx          # Global state + localStorage persistence
│   │   └── ThemeContext.tsx         # CSS variable theme switching
│   ├── data/
│   │   ├── wordle-words.json        # 100 puzzles × 3 tiers + 8,522 valid guesses
│   │   ├── crosswords.json          # 30 crossword grids (10 per tier)
│   │   └── shop-items.json          # Theme CSS vars + avatar metadata
│   ├── hooks/
│   │   ├── useWordle.ts             # Wordle game logic + in-progress save/restore
│   │   ├── useCrossword.ts          # Crossword logic + timer + hint system
│   │   └── useStorage.ts            # Typed localStorage hook
│   ├── types/index.ts               # All TypeScript interfaces
│   └── utils/
│       ├── scoring.ts               # Score calculation formulas
│       └── difficulty.ts            # Adaptive tier logic
├── vite.config.ts                   # viteSingleFile plugin — outputs one self-contained HTML file
└── prompt.md                        # Original product spec
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| State | React Context + `useReducer` |
| Persistence | `localStorage` |
| Build output | Single `index.html` via `vite-plugin-singlefile` |

---

## Data Notes

- **Wordle word list** — 8,522 valid guess words sourced from the macOS system dictionary (`/usr/share/dict/words`), filtered to lowercase 5-letter words with no proper nouns. Answer words are curated at Grade 5 reading level.
- **Crossword puzzles** — 30 pre-generated grids (10 per difficulty tier). The grid format uses rows 0/2/4 as full 5-letter across words and a `X # X # X` pattern for rows 1/3, with 3 down words spanning all 5 rows. All intersections are programmatically verified.
- To generate more crossword puzzles, see `scripts/generate-puzzles.ts` (requires Anthropic API key, runs once at build time).

---

## Expanding Puzzle Content

The current build ships **100 Wordle puzzles** and **30 Crossword puzzles**. To reach the full 100 crosswords per tier:

1. Run the generation script (or add puzzles manually to `src/data/crosswords.json`)
2. Each puzzle needs: `id`, `puzzleIndex` (1–100), `difficulty` (1/2/3), a `grid` (5×5 array), and `clues.across` / `clues.down`
3. Rebuild: `npm run build`

---

## Resetting Progress

Go to **Settings** (⚙️ on the home screen) → **Reset All Progress**. This clears all `localStorage` keys prefixed with `pq_`.
