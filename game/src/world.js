// The kitchen's memory and rules: who ordered what, what is stacked on the plate,
// what is sizzling in the pan, and how the day is going. Nothing here draws or
// listens; main.js feeds it clicks and steps, render.js reads what it holds.

import { COOK, INGREDIENT_BY_ID, LIVES_START, ORDERS_MAX, RECIPES, SERVES_PER_LEVEL } from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_LEFT = 2;
export const EVENT_OVER = 4;
export const EVENT_WRONG = 8;

let orderSerial = 0;

export function createWorld(random) {
  const state = {
    time: 0,
    orders: [], // { id, recipe, patience, patienceMax, face }
    plate: [], // ingredient ids, bottom first; cooked items arrive via the pan
    pan: null, // { id, t } while something sizzles
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    lives: LIVES_START,
    served: 0,
    lost: 0,
    level: 1,
    spawnIn: 0,
    steam: [], // { x, y, r, life } puffs rising off the pan
    burst: [], // { x, y, vx, vy, life } coin sparks after a serve
    flash: '', // short-lived banner text ("+58", "TOO RAW!", ...)
    flashT: 0,
    lastServe: null, // { recipeName, coins } for the game-over summary
  };

  function patienceForLevel() {
    return Math.max(26, 49 - (state.level - 1) * 3.5);
  }

  function spawnOrder() {
    const recipe = RECIPES[random.int(0, RECIPES.length - 1)];
    const patience = patienceForLevel() * random.range(0.9, 1.1);
    orderSerial += 1;
    state.orders.push({
      id: orderSerial,
      recipe,
      patience,
      patienceMax: patience,
      face: random.int(0, 3),
    });
  }

  function reset() {
    state.time = 0;
    state.orders = [];
    state.plate = [];
    state.pan = null;
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.lives = LIVES_START;
    state.served = 0;
    state.lost = 0;
    state.level = 1;
    state.spawnIn = 0;
    state.steam = [];
    state.burst = [];
    state.flash = '';
    state.flashT = 0;
    state.lastServe = null;
    spawnOrder();
    spawnOrder();
  }

  /** Where the pan item stands: 'cooking', 'ready' or 'burnt'. */
  function panStage() {
    if (!state.pan) return null;
    const item = INGREDIENT_BY_ID[state.pan.id];
    const frac = state.pan.t / item.cook;
    if (frac >= COOK.burntAt) return 'burnt';
    if (frac >= COOK.readyFrom && frac <= COOK.readyUntil) return 'ready';
    return 'cooking';
  }

  /** Click (or key) an ingredient bin. Returns a short outcome word for feedback. */
  function addIngredient(id) {
    const item = INGREDIENT_BY_ID[id];
    if (!item) return 'none';
    if (item.cook > 0) {
      if (state.pan) return 'pan-busy';
      state.pan = { id, t: 0 };
      return 'pan-started';
    }
    state.plate.push(id);
    return 'plated';
  }

  /** Click the pan: a ready item moves to the plate, a burnt one is scraped out. */
  function takePan() {
    if (!state.pan) return 'none';
    const stage = panStage();
    if (stage === 'ready') {
      state.plate.push(state.pan.id);
      state.pan = null;
      return 'plated';
    }
    if (stage === 'burnt') {
      state.pan = null;
      return 'scrapped';
    }
    return 'too-raw';
  }

  function clearPlate() {
    state.plate = [];
  }

  function stacksMatch(want, got) {
    if (want.length !== got.length) return false;
    return want.every((id, index) => got[index] === id);
  }

  /** Serve the plate to the longest-waiting customer. Events report the outcome. */
  function serve() {
    const order = state.orders[0];
    if (!order) return EVENT_WRONG;
    if (!stacksMatch(order.recipe.stack, state.plate)) {
      state.combo = 0;
      state.flash = 'NOT THE ORDER!';
      state.flashT = 1.1;
      return EVENT_WRONG;
    }
    const patienceLeft = Math.max(0, order.patience / order.patienceMax);
    const tip = Math.round(order.recipe.price * 0.7 * patienceLeft);
    const comboBonus = state.combo * 4;
    const earned = order.recipe.price + tip + comboBonus;
    state.coins += earned;
    state.score += earned;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.lastServe = { recipeName: order.recipe.name, coins: earned };
    state.flash = `+${earned} COINS`;
    state.flashT = 1.3;
    for (let i = 0; i < 14; i += 1) {
      state.burst.push({
        x: 1080 + random.range(-70, 70),
        y: 330 + random.range(-30, 30),
        vx: random.range(-70, 70),
        vy: random.range(-190, -60),
        life: random.range(0.5, 1.0),
      });
    }
    state.orders.shift();
    state.plate = [];
    if (state.served % SERVES_PER_LEVEL === 0) state.level += 1;
    if (state.orders.length < 2) spawnOrder();
    return EVENT_SERVED;
  }

  function step(dt) {
    let events = 0;
    state.time += dt;
    if (state.flashT > 0) state.flashT -= dt;

    if (state.pan) {
      state.pan.t += dt;
      if (random.next() < 0.35) {
        state.steam.push({ x: 566 + random.range(-46, 46), y: 566, r: random.range(5, 10), life: 1 });
      }
    }
    for (const puff of state.steam) {
      puff.y -= 34 * dt;
      puff.x += 8 * dt;
      puff.life -= dt * 0.9;
      puff.r += 7 * dt;
    }
    state.steam = state.steam.filter((puff) => puff.life > 0);
    for (const spark of state.burst) {
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vy += 320 * dt;
      spark.life -= dt;
    }
    state.burst = state.burst.filter((spark) => spark.life > 0);

    state.spawnIn -= dt;
    if (state.spawnIn <= 0 && state.orders.length < ORDERS_MAX) {
      spawnOrder();
      state.spawnIn = Math.max(3.2, 7.5 - state.level * 0.55);
    }

    for (const order of state.orders) order.patience -= dt;
    const gone = state.orders.filter((order) => order.patience <= 0);
    if (gone.length > 0) {
      state.orders = state.orders.filter((order) => order.patience > 0);
      state.lost += gone.length;
      state.lives -= gone.length;
      state.combo = 0;
      state.flash = 'TOO SLOW!';
      state.flashT = 1.1;
      events |= EVENT_LEFT;
      if (state.lives <= 0) {
        state.lives = 0;
        events |= EVENT_OVER;
      }
    }
    return events;
  }

  reset();
  return { state, reset, step, addIngredient, takePan, clearPlate, serve, panStage };
}
