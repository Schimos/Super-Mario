// Generates Mossy Hollow's sound effects via the ElevenLabs Sound Generation
// API. Run in CI (see .github/workflows/generate-sfx.yml) where the
// ELEVEN_LABS secret is available — this script is never run with the key
// available locally.
//
// Usage: ELEVEN_LABS=<key> node .github/scripts/generate-sfx.mjs
// Set FORCE_REGEN=1 to regenerate files that already exist.

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "..", "assets", "sfx");

const API_KEY = process.env.ELEVEN_LABS;
if (!API_KEY) {
  console.error("ELEVEN_LABS env var is not set — aborting.");
  process.exit(1);
}

const STYLE_PREFIX = "Retro 8-bit arcade video game sound effect, chiptune square-wave synth, crisp and short, no voice, no music bed: ";

// ElevenLabs' sound-generation API enforces a hard floor of 0.5s for
// duration_seconds — every entry below must be >= 0.5 or the request 400s.
const SOUNDS = [
  { id: "jump", duration: 0.5, prompt: STYLE_PREFIX + "a short rising jump blip." },
  { id: "double_jump", duration: 0.5, prompt: STYLE_PREFIX + "a quick two-note ascending double-jump blip, higher pitched than a single jump." },
  { id: "stomp", duration: 0.5, prompt: STYLE_PREFIX + "a squashy descending stomp/pop when landing on an enemy." },
  { id: "coin", duration: 0.5, prompt: STYLE_PREFIX + "a bright two-note coin/dewdrop pickup chime." },
  { id: "grow", duration: 1.2, prompt: STYLE_PREFIX + "an ascending triumphant arpeggio for a character growing bigger from a power-up." },
  { id: "shrink", duration: 0.6, prompt: STYLE_PREFIX + "a short descending buzzy blip for a character shrinking back down after being hit." },
  { id: "hurt", duration: 0.5, prompt: STYLE_PREFIX + "a short negative buzz for the player getting hurt and losing a life." },
  { id: "gameover", duration: 1.8, prompt: STYLE_PREFIX + "a descending sad game-over jingle, several notes falling in pitch." },
  { id: "fire", duration: 0.5, prompt: STYLE_PREFIX + "a quick zappy laser/ember-shot blip." },
  { id: "glowspark", duration: 1.0, prompt: STYLE_PREFIX + "a sparkling ascending shimmer arpeggio for a temporary invincibility power-up." },
  { id: "block_bump", duration: 0.5, prompt: STYLE_PREFIX + "a short hollow wooden thump/bonk for bumping a block from underneath." },
  { id: "extra_life", duration: 1.2, prompt: STYLE_PREFIX + "a cheerful short fanfare jingle for earning an extra life." },
  { id: "victory", duration: 2.5, prompt: STYLE_PREFIX + "a short triumphant fanfare jingle for completing a level." },
  { id: "title_open", duration: 2.0, prompt: STYLE_PREFIX + "a cheerful short power-on startup jingle for a title screen." },
  { id: "select", duration: 0.5, prompt: STYLE_PREFIX + "a short crisp menu-select confirm click-blip." },
];

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function generateOne(sound) {
  const dest = path.join(OUT_DIR, `${sound.id}.mp3`);
  if (!process.env.FORCE_REGEN && (await exists(dest))) {
    console.log(`skip ${sound.id} (already exists)`);
    return;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: sound.prompt,
        duration_seconds: sound.duration,
        prompt_influence: 0.4,
      }),
    });

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      console.log(`generated ${sound.id} (${buf.length} bytes)`);
      return;
    }

    const bodyText = await res.text().catch(() => "");
    console.error(`[${sound.id}] attempt ${attempt} failed: HTTP ${res.status} ${bodyText.slice(0, 500)}`);
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 3000 * attempt));
      continue;
    }
    throw new Error(`${sound.id}: HTTP ${res.status}`);
  }
  throw new Error(`${sound.id}: exhausted retries`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let failures = 0;
  for (const sound of SOUNDS) {
    try {
      await generateOne(sound);
    } catch (err) {
      failures++;
      console.error(`FAILED: ${sound.id}:`, err.message);
    }
  }
  if (failures > 0) {
    console.error(`${failures} sound(s) failed to generate.`);
    process.exit(1);
  }
}

main();
