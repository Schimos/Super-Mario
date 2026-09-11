# Mossy Hollow — recurring QA log

Automated QA loop: every cycle, 4 independent reviewer-persona panelists
(Player Experience, QA/Test Engineer, Game Designer, Software Engineer)
score the game 0-10 across 10 fixed categories. The **main score** for a
cycle is the minimum score any single panelist gave any single category
(i.e. the floor across the whole panel x category grid). Runs on a
recurring schedule (~every 4 hours); once every category's floor score
reaches 9, the loop switches to monitoring mode — it keeps re-scoring on
schedule but only acts if something regresses below 9.

Categories: Gameplay & Fun Factor · Controls & Responsiveness · Level
Design & Difficulty Balance · Visual/Art Quality & Consistency · Audio &
Sound Design · Technical Stability · Performance · Code Quality &
Maintainability · UI/UX & Onboarding/Accessibility · Cross-Platform/Device
Compatibility.

---

## Cycle 1 — 2026-09-11

**Pre-review fix:** this branch (`claude/vigilant-brown-452xfo`) had
already been merged into `main`, but was one commit behind — it was
missing `assets/sfx/*.mp3` entirely (main had generated them via the
ElevenLabs workflow after the merge). Every sound effect 404'd. Reset the
branch onto `origin/main` and pushed, which pulled those files in before
the panel even started.

### Scores (four panelists, min per category = **main score**)

| Category | Player Exp. | QA Engineer | Game Designer | SW Engineer | **Min** |
|---|---|---|---|---|---|
| Gameplay & Fun Factor | 6 | 7 | 7 | 7 | **6** |
| Controls & Responsiveness | 8 | 7 | 8 | 8 | **7** |
| Level Design & Difficulty Balance | 5 | 6 | 5 | 6 | **5** |
| Visual/Art Quality & Consistency | 8 | 7 | 6 | 7 | **6** |
| Audio & Sound Design | 6 | 7 | 6 | 6 | **6** |
| Technical Stability | 7 | 6 | 8 | 7 | **6** |
| Performance | 7 | 8 | 8 | 8 | **7** |
| Code Quality & Maintainability | 6 | 8 | 7 | 8 | **6** |
| UI/UX & Onboarding/Accessibility | 6 | 6 | 5 | 6 | **5** |
| Cross-Platform/Device Compatibility | 6 | 5 | 6 | 7 | **5** |

**Cycle 1 main score: 5/10** (tied lowest: Level Design, UI/UX, Cross-Platform)

### Findings acted on this cycle

- **Fixed:** missing favicon → 404 on every load (all 4 panelists flagged it).
- **Fixed:** `#touch-controls` was absolutely positioned *inside* `#frame`,
  overlapping the bottom of the playfield on portrait phones (QA Engineer's
  #1 finding, visible in the mobile screenshot). Moved it to be a sibling
  of `#frame` with its own space below, and reserved that vertical space
  in `#frame`'s width/height calc.
- **Fixed:** start screen instructions were screen-reader-only, invisible
  to sighted players (Game Designer + others). Added a visible controls
  legend pill on the title screen.
- **Fixed:** backgrounding the tab cleared stuck input but didn't pause
  the simulation — physics/enemies/timer kept advancing unseen (QA
  Engineer). Added a `simPaused` flag toggled by `blur`/`focus`/
  `visibilitychange`.
- **Fixed:** README and an in-file comment still listed power-ups and
  sound as "deliberately left out of this MVP" though both had shipped
  (Game Designer flagged the doc as stale/misleading to contributors).

### Backlog for future cycles (bigger scope, not attempted in one pass)

- **Level Design (5) / Gameplay (6):** only one ~80-tile level exists, no
  difficulty progression or level-select. All 4 panelists independently
  flagged this as the single biggest ceiling on those two scores. Adding
  a second level (or a loop with escalating difficulty) is the highest
  expected-value fix for the next cycle(s).
- **Code Quality (6):** single ~1800-line IIFE with module-level mutable
  globals and some duplication in `updateEnemies` branches (stomp/shell/
  snapper). SW Engineer suggested splitting into modules (state/physics/
  render/entities) — worth doing once there's more than one level to
  justify the structure.
- **Audio (6):** SFX are wired and load correctly, but there's no
  background music/ambience — several panelists noted the world feels
  "sterile" during play.
- Note: an external Google Fonts request fails with `ERR_CONNECTION_RESET`
  in this sandbox's network only — CSS already has local font fallbacks,
  and this is not confirmed to reproduce on the real deployed site. Not
  scored as a bug; worth a one-time real-browser check outside the
  sandbox before ruling it out entirely.

---

## Cycle 2 — 2026-09-11

**Pre-review:** `main` had moved on its own since cycle 1 — a deploy-ssh
fix, and a new feature (a public Supabase-backed leaderboard on the win
screen: submit name+score, view top 10; anon key substituted at deploy
time from a repo secret, RLS-restricted). Merged `main` into the QA
branch before reviewing, so the panel evaluated the combined state.

Also new as of this cycle: every push to `main` now auto-deploys to both
GitHub Pages and the self-hosted SSH server with no manual gate (a
permanent rule the user set) — the QA branch is merged into `main` at
the end of every cycle from now on, not just pushed to the QA branch.

### Scores (min per category = **main score**)

| Category | Player Exp. | QA Engineer | Game Designer | SW Engineer | **Min** |
|---|---|---|---|---|---|
| Gameplay & Fun Factor | 7 | 6 | 6 | 7 | **6** |
| Controls & Responsiveness | 8 | 8 | 8 | 8 | **8** |
| Level Design & Difficulty Balance | 5 | 5 | 5 | 6 | **5** |
| Visual/Art Quality & Consistency | 8 | 7 | 8 | 7 | **7** |
| Audio & Sound Design | 6 | 6 | 6 | 6 | **6** |
| Technical Stability | 8 | 8 | 8 | 8 | **8** |
| Performance | 8 | 8 | 8 | 8 | **8** |
| Code Quality & Maintainability | 6 | 8 | 7 | 6 | **6** |
| UI/UX & Onboarding/Accessibility | 7 | 8 | 7 | 7 | **7** |
| Cross-Platform/Device Compatibility | 8 | 8 | 7 | 8 | **7** |

**Cycle 2 main score: 5/10** (Level Design & Difficulty Balance — unchanged from cycle 1)

Improved since cycle 1: Technical Stability 6→8, Performance 7→8,
Cross-Platform 5→7, UI/UX 5→7, Controls 7→8, Visual 6→7 — the cycle-1
fixes (mobile touch layout, visible controls legend, favicon,
pause-on-background-tab) held up under a fresh independent review, and
this cycle's fixes (below) addressed a new regression cleanly.

### Findings acted on this cycle

- **Fixed (regression, all 4 panelists' screenshots confirmed it):** the
  new leaderboard content made the win screen taller than the frame on
  short/mobile viewports; `.overlay` used `justify-content:center` with
  no overflow handling, so the title and "PLAY AGAIN" button were
  silently clipped and completely unreachable. Now uses `overflow-y:auto`
  with a `margin:auto`-centered `.overlay-inner` wrapper (centers when it
  fits, scrolls top-anchored instead of clipping when it doesn't), plus
  `touch-action:pan-y` so a real phone's swipe-scroll isn't blocked by
  the global `touch-action:none` on `html,body`.
- **Fixed (UX, Player Experience panelist):** added a bobbing "more
  below" hint on the win screen, visible only while content actually
  overflows, so a mobile player has a reason to scroll instead of
  thinking the game stalled after submitting a name.
- **Fixed (QA Engineer + SW Engineer):** pinned the `supabase-js` CDN
  script to an exact version (`2.116.0`) instead of the floating `@2`
  tag, which risked a silent breaking change on a future minor release.
- **Fixed (QA Engineer):** a stale-response race — clicking "Play Again"
  while a leaderboard fetch/score submit was still in flight could let
  the stale response land after and overwrite the next run's win-screen
  state. `refreshLeaderboard()` and the submit handler now bail out if
  `state` has moved on from `STATE.WIN`.
- **Fixed (Game Designer):** the leaderboard panel now shows "No scores
  yet — be the first!" for a working leaderboard with zero rows, instead
  of looking identical to "leaderboard unavailable" by just staying
  hidden.

### Backlog for future cycles (unchanged focus, not attempted this cycle)

- **Level Design (5) / Gameplay (6):** still the single ~80-tile level,
  no difficulty progression or level-select — flagged by all 4
  panelists again this cycle. Remains the highest expected-value fix.
  The Game Designer panelist noted the new leaderboard is "a thin
  competitive layer sitting on unchanged content" — it doesn't move this
  score on its own.
- **Code Quality (6):** still one large single-file IIFE with mutable
  globals; the SW Engineer panelist noted the leaderboard code itself is
  clean and well-isolated, but it's now a third concern (network/auth)
  mixed into the same file alongside game loop + rendering — modularizing
  (state/physics/render/leaderboard) is worth doing once there's more
  than one level to justify the restructure.
- **Audio (6):** still no background music/ambience.
- New, lower-priority items surfaced but not acted on: no rate-limit or
  length/profanity check beyond client-side truncation on leaderboard
  submissions (RLS CHECK constraints already bound name length and score
  range per the README, so abuse risk is limited but not zero — this is
  a "casual leaderboard," as the README already says).

---

<!-- Next cycle: append a new "## Cycle N — <date>" section above this
     line, following the same format. -->
