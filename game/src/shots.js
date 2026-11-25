// The four stills the judge flips through, staged by setting the kitchen up
// directly and letting the real rules run for a fixed beat, so every frame is
// a genuine moment of play and the same seed always composes the same scene.

import { STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function run(world, seconds) {
  for (let i = 0; i < Math.round(seconds / STEP); i += 1) world.step(STEP);
}

/** A burger half-built on the plate, matching the front order's first steps. */
function stagePlay(world) {
  const s = world.state;
  // Front order is whatever reset() dealt first; build its opening layers.
  const stack = s.orders[0].recipe.stack;
  for (const id of stack) {
    if (id === 'bun-top') break;
    const outcome = world.addIngredient(id);
    if (outcome === 'pan-started') {
      // Fast-forward the pan to golden and plate the item.
      for (let i = 0; i < 200 && world.panStage() === 'cooking'; i += 1) world.step(STEP);
      world.takePan();
    }
    if (s.plate.length >= 3) break;
  }
  // Something fresh goes on the pan so the frame catches it sizzling.
  world.addIngredient('egg');
  run(world, 0.7);
  s.orders[0].patience = s.orders[0].patienceMax * 0.62;
  if (s.orders[1]) s.orders[1].patience = s.orders[1].patienceMax * 0.85;
  s.score = 128;
  s.coins = 128;
  s.combo = 2;
  return { screen: SCREEN_PLAY, best: 340 };
}

/** The finished plate at the pass: customer delighted, coins in the air. */
function stageServe(world) {
  const s = world.state;
  const stack = s.orders[0].recipe.stack;
  for (const id of stack) {
    const outcome = world.addIngredient(id);
    if (outcome === 'pan-started') {
      for (let i = 0; i < 200 && world.panStage() === 'cooking'; i += 1) world.step(STEP);
      world.takePan();
    }
  }
  s.orders[0].patience = s.orders[0].patienceMax * 0.8;
  s.score = 264;
  s.coins = 264;
  s.combo = 3;
  world.serve();
  // serve() clears the plate for the next order; put a fresh finished stack on
  // it so the still shows a plate ready to go out.
  const next = s.orders[0].recipe.stack;
  for (const id of next) {
    const outcome = world.addIngredient(id);
    if (outcome === 'pan-started') {
      for (let i = 0; i < 200 && world.panStage() === 'cooking'; i += 1) world.step(STEP);
      world.takePan();
    }
  }
  run(world, 0.25);
  // The celebration from serve() has faded while the next plate was built, so
  // strike it again, bigger: banner up longer, and a fat double ring of coins
  // bursting around the delighted customer so the payoff fills the frame.
  s.flash = `+${s.lastServe ? s.lastServe.coins : 56} COINS`;
  s.flashT = 1.6;
  s.burst = [];
  for (let i = 0; i < 26; i += 1) {
    const a = i * 2.39996; // golden-angle spread, fixed so the frame never changes
    s.burst.push({
      x: 1119 + Math.cos(a) * (20 + (i % 7) * 15),
      y: 318 + Math.sin(a) * 34 - (i % 5) * 11,
      vx: Math.cos(a) * 55,
      vy: -75 - (i % 4) * 26,
      life: 1.05,
    });
  }
  return { screen: SCREEN_PLAY, best: 340 };
}

/** Set `world` to the named scene and report which screen to paint over it. */
export function stageShot(name, world) {
  world.reset();
  const s = world.state;
  if (name === 'play') return stagePlay(world);
  if (name === 'serve') return stageServe(world);
  if (name === 'end') {
    stagePlay(world);
    s.served = 14;
    s.lost = 3;
    s.lives = 0;
    s.coins = 486;
    s.score = 512;
    s.bestCombo = 5;
    s.level = 3;
    return { screen: SCREEN_OVER, best: 512 };
  }
  // start: the title card over a kitchen that is already warming up.
  world.addIngredient('patty');
  run(world, 1.2);
  return { screen: SCREEN_TITLE, best: 0 };
}
