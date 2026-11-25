// Boot and the one loop. Clicks and keys are drained every frame, the world
// advances in fixed steps, and the renderer paints the result. The kitchen is
// always alive behind the title card; serving, pausing and closing all flow
// through the same small state machine.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N)
// stages one still scene instead of the loop, paints it twice and raises
// window.__shotReady for the screenshotter.

import { BEST_KEY, INGREDIENTS, LAYOUT, STEP, binRect } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_LEFT, EVENT_OVER, EVENT_SERVED, EVENT_WRONG } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_SERVE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private windows refuse storage; the best score then lasts the visit.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, world.panStage);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function inside(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Kitchen open. Build the next order on the board.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Kitchen closed. Score ${world.state.score}. Best ${best}.`);
  }

  function routeClick(point) {
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (inside(point, LAYOUT.serveBtn)) {
      handleEvents(world.serve());
      return;
    }
    if (inside(point, LAYOUT.trashBtn)) {
      world.clearPlate();
      announce('Plate binned.');
      return;
    }
    const pan = LAYOUT.pan;
    if (Math.hypot(point.x - pan.x, point.y - pan.y) <= pan.r + 14) {
      const outcome = world.takePan();
      if (outcome === 'too-raw') announce('Still raw - give it a moment.');
      else if (outcome === 'scrapped') announce('Burnt item scrapped.');
      else if (outcome === 'plated') announce('Onto the plate.');
      return;
    }
    INGREDIENTS.forEach((item, index) => {
      if (inside(point, binRect(index))) {
        const outcome = world.addIngredient(item.id);
        if (outcome === 'pan-busy') announce('The pan is busy.');
        else if (outcome === 'pan-started') announce(`${item.name} on the pan.`);
      }
    });
  }

  function handleEvents(events) {
    if (events & EVENT_OVER) endGame();
    else if (events & EVENT_SERVED) announce(`Served. ${world.state.coins} coins.`);
    else if (events & EVENT_LEFT) announce('A customer left angry!');
    else if (events & EVENT_WRONG) announce('That is not the order on the board.');
  }

  function handleInput() {
    for (const point of input.takeClicks()) routeClick(point);
    const key = input.takeKey();
    if (key && screen === SCREEN_PLAY) {
      const item = INGREDIENTS.find((entry) => entry.key === key);
      if (item) world.addIngredient(item.id);
    }
    const actions = input.takeActions();
    if (actions & ACTION_SERVE && screen === SCREEN_PLAY) handleEvents(world.serve());
    else if (actions & ACTION_CONFIRM && screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Cooking again.');
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleInput();
    if (screen === SCREEN_PLAY || screen === SCREEN_TITLE) {
      while (accumulator >= STEP) {
        const events = world.step(STEP);
        accumulator -= STEP;
        if (screen === SCREEN_PLAY) handleEvents(events);
        if (screen !== SCREEN_PLAY && screen !== SCREEN_TITLE) {
          accumulator = 0;
          break;
        }
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, world.panStage);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
  });

  announce('Sizzle Street Kitchen. Click to open.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
