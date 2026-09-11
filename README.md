# Mossy Hollow

A lightweight, original-IP 2D platformer MVP — built with plain HTML5 canvas
and vanilla JavaScript. No build step, no dependencies beyond two Google
Fonts, no game engine. Guide Sprig the moss-sprite through the hollow: hop on
spikeshrooms from above, collect dewdrops, and reach the glowing portal.

This is intentionally an original character and world (not Nintendo's Mario)
— see "Why an original character?" below.

**Play it live:** https://schimos.github.io/Super-Mario/ (deployed
automatically from `main` via the GitHub Actions workflow in
`.github/workflows/deploy-pages.yml`).

## Run it

Just open `index.html` in a browser. That's it — no `npm install`, no local
server required (though any static server works too, e.g. `python3 -m http.server`).

## Controls

- **Move**: `←` `→` or `A` `D`
- **Jump**: `Space`, `↑`, or `W` (hold for a higher jump)
- **Touch**: on-screen buttons appear automatically on touch/small-screen devices

## Leaderboard

Clearing the level lets a player submit their name and dewdrop score to a
public leaderboard, backed by a Supabase table (`leaderboard`: `name`,
`score`, `created_at`), and shows the current top 10.

This still ships with zero build tooling: `index.html` embeds the Supabase
project URL directly (not a secret) plus a literal placeholder,
`__SUPABASE_ANON_KEY__`, for the anon/publishable key. The deploy workflows
(`deploy-pages.yml`, `deploy-ssh.yml`) substitute that placeholder with the
real key from the `SUPABASE_API_KEY` repository secret at deploy time, so
the key never has to sit in source control. Locally, or if that secret
isn't set, the placeholder is left as-is, the Supabase client is never
created, and the leaderboard UI quietly disables itself instead of
erroring.

`SUPABASE_API_KEY` must be Supabase's public anon/publishable key (the one
protected by Row Level Security), never a `service_role` secret key — it
ends up in every player's browser. Row Level Security on the `leaderboard`
table allows anyone to read the top scores and insert a new one, with CHECK
constraints bounding name length and score range; there's no server-side
proof that a submitted score was actually earned in-game, so treat this as
a casual/for-fun leaderboard rather than a tamper-proof one.

## Project structure

```
index.html          the entire game — HTML, CSS, and JS, all inlined
docs/BUILD_PROMPT.md the spec this was built from (useful if you hand this
                     project to Claude Code for further work)
LICENSE              MIT
```

## How it's organized (inside index.html)

Search these section markers in the `<script>` block:

| Marker         | What's there |
|---|---|
| `[CONFIG]`     | tunable constants — physics, sizes, colors |
| `[LEVEL]`      | the level, described as data (pits/platforms/coins/enemies/goal) |
| `[INPUT]`      | keyboard + touch, merged into one control state |
| `[ENTITIES]`   | Player / Enemy / Coin / Portal classes |
| `[PHYSICS]`    | gravity, AABB tile collision (X pass, then Y pass) |
| `[CAMERA]`     | side-scroll follow + world culling |
| `[RENDER]`     | background parallax, tiles, entities, particles |
| `[GAME]`       | state machine (START → PLAYING → GAMEOVER / WIN) + main loop |
| `[LEADERBOARD]`| Supabase client + submit/fetch/render for the win-screen leaderboard |

## Extending it

- **Add a level** — add a new level object shaped like `LEVEL` and swap it in.
- **Add an enemy type** — add a `kind` field and a matching case in `Enemy`'s draw code.
- **Add a tile type** — extend `isSolidTile()` and `drawTiles()` together (they're the single source of truth for collision + rendering).

Power-ups (grow/fire forms), sound effects, and a Supabase-backed
leaderboard have since been added. Still deliberately left out: multiple
levels/level-select, save/progress persistence, background music,
multiplayer, and a level editor. Good v2 candidates, in roughly that order.

## Why an original character?

"Super Mario" and its characters are trademarked/copyrighted by Nintendo —
reproducing them, even for a free personal project, is a real legal risk.
The genre's *mechanics* (run, jump, stomp, collect, reach a goal) aren't
copyrightable, so this project uses those mechanics with an original
character and world instead.

## Next steps

`docs/BUILD_PROMPT.md` is a Claude Code–ready prompt for continuing this
project inside a proper Git/GitHub workflow (commits, `.gitignore`, optional
GitHub Pages deployment). Point Claude Code at this repo and hand it that
file when you're ready to keep building.
