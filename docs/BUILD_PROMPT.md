# Claude Code Build Prompt — Mossy Hollow (Git/GitHub edition)

This is an adjusted version of the original MVP prompt, for use with Claude
Code running against a real Git repository connected to GitHub (rather than
a single throwaway file). Copy everything in the code block into Claude
Code as your instruction.

What changed from the original prompt: it now assumes a real repo (commits,
`.gitignore`, a license, optional CI/deployment) instead of "just hand me
one HTML file," and it front-loads a planning checkpoint before any files
get written or pushed, since you've said before you'd rather review a plan
than have it executed straight away.

If this repo already has `index.html` in it (e.g. you copied it in from the
local project folder), tell Claude Code that up front — it should treat step
1 below as "review what's here" rather than "build from zero."

---

## The prompt

```
Continue/build "Mossy Hollow" — a lightweight, original-IP 2D platformer MVP
— inside this Git repository, connected to GitHub.

FIRST, before writing or changing any files: check whether index.html
already exists in this repo.
- If it does, read it, and tell me a short summary of what's already
  implemented and what (if anything) looks incomplete or buggy, then
  propose what you'll do next.
- If it doesn't, propose the file/repo structure and implementation plan
  (see "Repository & workflow" below) and wait for my go-ahead before
  creating files.
I'd rather review a short plan than have a repo's worth of commits show up
unannounced — so always pause for my approval before: initializing git (if
not already a repo), the first commit, any push to a remote, and adding any
GitHub Actions workflow. After that initial go-ahead, you can commit
incrementally as you build without asking before every single commit —
just keep each commit small and logically scoped (see below).

## Concept (skip this section if index.html already implements it — just
## keep it consistent)
A classic run-and-jump-and-stomp 2D side-scroller in the style of 1980s-90s
platformers, but with an ORIGINAL character and art — not Nintendo's Mario.
Game mechanics (jump-and-stomp platforming) aren't copyrightable; specific
characters, sprites, and art are — so this stays an original IP inspired by
the genre only, freely shareable with no takedown risk.

## Tech stack (keep it lightweight — no build step)
- Plain HTML5 + CSS + vanilla JavaScript (ES6+). No React/Vue/game engine
  (no Phaser, no Quintus) and no bundler/webpack/vite.
- Rendering via the HTML5 <canvas> 2D context.
- Single self-contained index.html at the REPO ROOT (inline <style> and
  <script>, zero external runtime dependencies besides Google Fonts links).
  Keeping it at the root means GitHub Pages can serve it directly with zero
  extra config ("Deploy from branch: main / root").
- Target payload under ~300KB — procedurally drawn/CSS-shape art, no large
  image or audio files for the MVP.

## Core architecture
- Game loop: requestAnimationFrame with delta-time updates, clamped to
  avoid huge jumps on tab-refocus.
- Entity model: simple objects/classes for Player, Enemy, Collectible,
  Platform/Tile — array of entities, not scattered globals.
- Level representation: a data-driven description (tile grid, or pit/
  platform/coin/enemy/goal coordinate lists) — not a giant hand-authored
  ASCII grid. Make adding a second level a matter of adding a new data
  object, not rewriting logic.
- Camera: side-scrolling, follows the player, clamps at level bounds,
  only renders what's currently visible.
- Collision: axis-aligned bounding box (AABB) tile collision, X and Y
  resolved in separate passes (avoids corner-clipping).

## Physics / feel
- Gravity + jump impulse; horizontal acceleration/deceleration (not
  instant velocity); a little air control.
- Coyote time and jump buffering are nice-to-have polish, not required.
- Terminal fall speed cap.
- IMPORTANT: if you implement a brief post-hit invulnerability window,
  make sure a pit-fall death always resolves (respawns/loses a life)
  even while that invulnerability is active — don't let the same
  invulnerability guard block a fall-death from resolving, or the player
  can end up free-falling unresolved for a second or more. (This bit us
  in an earlier build — worth testing explicitly: fall into the same pit
  twice in a row, immediately after respawning.)

## MVP feature checklist (must-have)
1. Player: idle/run/jump states, basic animation.
2. Movement: left/right run, jump (variable height if held vs tapped),
   gravity, solid-ground collision.
3. One playable level (~30-60s) with gaps and at least 2-3 raised platforms.
4. At least one enemy type with patrol AI, defeated by stomping from above,
   damages the player on side contact.
5. Collectibles that increment a visible score counter.
6. A clear goal trigger (flag/door/portal — not a literal Mario flagpole)
   that triggers a "Level Complete" state.
7. Lives or health (e.g. 3 lives; pit or enemy contact costs one; 0 = Game Over).
8. HUD: score, lives/health, level name/timer.
9. Game states: Start → Playing → Game Over → Win, each restartable without
   a page reload.
10. Controls: Arrow keys AND WASD, PLUS on-screen touch buttons that appear
    on touch devices.

## Explicit non-goals (call these out as future work, don't build them)
Multiple levels/level select, save/progress persistence, power-ups,
sound/music, multiplayer, a level editor, backend/server, analytics.

## Repository & workflow
- Initialize git if this isn't already a repo (ask first, per above).
- Add a `.gitignore` (OS cruft, editor folders; node_modules/dist even
  though this MVP needs no build tooling, in case that changes later).
- Add a `README.md`: what the game is, controls, how to run it (open
  index.html, no build step), the section-marker map inside index.html,
  and how to extend it (add a level/enemy/tile type).
- Add an MIT `LICENSE` (or whatever license I tell you), given the
  original-character approach above.
- Commit incrementally with clear, scoped messages as you build — e.g.
  "scaffold repo", "add player movement + gravity", "add level + tile
  collision", "add enemies + coins", "add HUD + win/lose states", "polish
  + README" — not one giant commit at the end.
- Don't push to any remote, rewrite history, or force-push without asking
  first, even if a remote is already configured.
- Optional, ask before doing it: add a minimal GitHub Actions workflow
  that deploys to GitHub Pages on push to main (this is a static file, so
  the workflow can be as simple as the official actions/deploy-pages
  action — no build step needed).

## Code quality / deliverable expectations
- Well-commented, organized into clear sections (constants/config,
  entities, input, physics/collision, rendering, game loop, UI/state).
- No console errors or warnings during normal play.
- Stable ~60fps on a mid-range laptop; clean up event listeners/animation
  frame IDs on restart so repeated restarts don't leak or stack loops.
- Responsive canvas sizing, playable on both desktop and mobile viewport
  widths.

## Acceptance criteria (verify before calling it done — and tell me the
## results, don't just assume)
- Opening index.html directly (no server, no build) shows a start screen;
  starting begins gameplay.
- Player can traverse the whole level with keyboard only, and separately
  with touch controls only (resize to a mobile viewport to confirm the
  on-screen buttons appear and work).
- Jumping on the enemy defeats it; touching it from the side costs a life;
  0 lives shows Game Over with a restart option.
- Falling into a pit costs a life and respawns cleanly — including right
  after a previous respawn, per the invulnerability note above.
- Collecting coins updates the score; reaching the goal shows a Win screen
  with the final score.
- No uncaught JS errors in the browser console through a full playthrough
  and at least one restart cycle.
```
