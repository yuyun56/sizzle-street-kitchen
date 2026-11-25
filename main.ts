// Sizzle Street Kitchen — the hand-in program (Node 22, standard library only).
// The game itself is the game/ folder beside this file: plain static pages a
// desktop browser opens offline, no build step and no network. This program
// copies game/ and screenshots/ into the output directory and writes
// dossier.json there with the vendored make.fun library, which is the summary
// the judge reads.
//
// Run it the way the grader does, with MAKEFUN_OUTPUT_DIR standing in for
// /output when you try it yourself:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Play it locally with:  node serve.ts   (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's own gate: at most 4 screenshots of 256 KiB,
// the game tree under 993 files and 48 MiB, no game path over 1000 bytes,
// and the dossier's text budget of 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
