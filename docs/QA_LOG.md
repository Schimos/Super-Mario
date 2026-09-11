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

<!-- Next cycle: append a new "## Cycle N — <date>" section above this
     line, following the same format. -->
