// Everything the player sees, painted on one canvas: the tiled kitchen, the
// order board, the customer at the hatch, the plate stack, the sizzling pan,
// the ingredient bins and the title / game-over cards. Pure reading: draw()
// looks at the world state and the current screen, and paints; it never
// changes the game.

import { INGREDIENTS, INGREDIENT_BY_ID, LAYOUT, VIEW, binRect } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const SKIN = ['#f2c79b', '#c68850', '#8a5a33', '#ffd9b0'];
const HAIR = ['#3a2415', '#101010', '#b5533c', '#e8c33a'];
const SHIRT = ['#3f7fbf', '#c24a6d', '#3f9e63', '#7a4fd0'];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = 700) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Verdana, Geneva, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

// One ingredient as a horizontal layer of a stack, centred on cx with its base
// at cy, `w` wide. Returns the height it took, so stacks can pile upward.
export function drawLayer(ctx, id, cx, cy, w) {
  const item = INGREDIENT_BY_ID[id];
  const c = item.color;
  const h = 17;
  ctx.save();
  if (id === 'bun-bottom') {
    ctx.fillStyle = c;
    roundRect(ctx, cx - w / 2, cy - h, w, h, 7);
    ctx.fill();
    ctx.fillStyle = 'rgba(146,90,32,.55)';
    ctx.fillRect(cx - w / 2 + 4, cy - 4, w - 8, 3);
  } else if (id === 'bun-top') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy);
    ctx.quadraticCurveTo(cx, cy - h * 2.1, cx + w / 2, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.ellipse(cx + i * w * 0.16, cy - h * (0.9 + (Math.abs(i) % 2) * 0.35), 3.4, 2, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    return h * 1.55;
  } else if (id === 'patty') {
    ctx.fillStyle = c;
    roundRect(ctx, cx - w / 2, cy - h + 2, w, h - 2, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    for (let i = -3; i <= 3; i += 1) ctx.fillRect(cx + i * w * 0.12, cy - h + 6, 7, 3);
  } else if (id === 'cheese') {
    ctx.fillStyle = c;
    ctx.fillRect(cx - w / 2, cy - 9, w, 9);
    ctx.beginPath();
    for (let i = -2; i <= 2; i += 1) {
      const dx = cx + i * w * 0.19;
      ctx.moveTo(dx - 7, cy - 1);
      ctx.lineTo(dx + 7, cy - 1);
      ctx.lineTo(dx, cy + 6 + (i % 2 === 0 ? 2 : 0));
      ctx.closePath();
    }
    ctx.fill();
    return 13;
  } else if (id === 'lettuce') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy - 6);
    for (let x = -w / 2; x < w / 2; x += 10) ctx.quadraticCurveTo(cx + x + 5, cy - 15, cx + x + 10, cy - 6);
    ctx.lineTo(cx + w / 2, cy + 2);
    ctx.lineTo(cx - w / 2, cy + 2);
    ctx.closePath();
    ctx.fill();
    return 13;
  } else if (id === 'tomato') {
    ctx.fillStyle = c;
    roundRect(ctx, cx - w / 2, cy - h + 3, w, h - 3, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.ellipse(cx + i * w * 0.18, cy - 6, 4, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'onion') {
    ctx.strokeStyle = c;
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(cx + i * w * 0.17, cy - 2, 8.5, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }
    return 12;
  } else if (id === 'egg') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 7, w * 0.34, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.beginPath();
    ctx.arc(cx - 2.5, cy - 10.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    return 15;
  } else if (id === 'toast') {
    ctx.fillStyle = '#b57a35';
    roundRect(ctx, cx - w * 0.3, cy - h - 4, w * 0.6, h + 4, 8);
    ctx.fill();
    ctx.fillStyle = c;
    roundRect(ctx, cx - w * 0.3 + 4, cy - h, w * 0.6 - 8, h - 3, 6);
    ctx.fill();
    return h + 2;
  } else if (id === 'pancake') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 6, w * 0.42, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,100,30,.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 9, w * 0.3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    return 14;
  } else if (id === 'berries') {
    const cols = ['#7a4fd0', '#4a6fd4', '#a03a7a', '#5a3fb8', '#7a4fd0'];
    for (let i = 0; i < 5; i += 1) {
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      ctx.arc(cx + (i - 2) * w * 0.13, cy - 6 - (i % 2) * 5, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3f9e4d';
    ctx.fillRect(cx - 2, cy - 20, 4, 6);
    return 16;
  } else if (id === 'cream') {
    ctx.fillStyle = c;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(cx, cy - 4 - i * 6, w * (0.3 - i * 0.07), 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return 20;
  }
  ctx.restore();
  return h;
}

function drawKitchen(ctx, state) {
  // Tiled back wall and a warm wooden counter front.
  ctx.fillStyle = '#f3e3c2';
  ctx.fillRect(0, 0, VIEW.width, 486);
  ctx.strokeStyle = 'rgba(190,150,90,.35)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= VIEW.width; x += 64) { ctx.beginPath(); ctx.moveTo(x, 196); ctx.lineTo(x, 486); ctx.stroke(); }
  for (let y = 196; y <= 486; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW.width, y); ctx.stroke(); }
  const counterGrad = ctx.createLinearGradient(0, 486, 0, 800);
  counterGrad.addColorStop(0, '#a06a38');
  counterGrad.addColorStop(0.12, '#8a5527');
  counterGrad.addColorStop(1, '#6e3f1c');
  ctx.fillStyle = counterGrad;
  ctx.fillRect(0, 486, VIEW.width, 314);
  ctx.fillStyle = '#c98d4e';
  ctx.fillRect(0, 486, VIEW.width, 12);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  for (let x = 40; x < VIEW.width; x += 150) ctx.fillRect(x, 520, 3, 260);

  // Window with a sunny street outside.
  ctx.fillStyle = '#7e4f22';
  roundRect(ctx, 28, 216, 236, 168, 8); ctx.fill();
  ctx.fillStyle = '#aee2ff';
  roundRect(ctx, 38, 226, 216, 148, 5); ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath(); ctx.arc(216, 258, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8fb8d8';
  ctx.fillRect(38, 322, 60, 52); ctx.fillRect(120, 306, 46, 68); ctx.fillRect(196, 330, 58, 44);
  ctx.fillStyle = '#5d8a4a';
  ctx.fillRect(38, 362, 216, 12);
  ctx.strokeStyle = '#7e4f22'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(146, 226); ctx.lineTo(146, 374); ctx.stroke();

  // Shelf with jars and bottles.
  ctx.fillStyle = '#7e4f22';
  ctx.fillRect(300, 300, 330, 12);
  const jarCols = ['#e5483c', '#ffb52e', '#69c24a', '#7a4fd0', '#e88bb0', '#4a6fd4'];
  jarCols.forEach((col, i) => {
    const jx = 322 + i * 52;
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    roundRect(ctx, jx, 258, 34, 42, 6); ctx.fill();
    ctx.fillStyle = col;
    roundRect(ctx, jx + 4, 272, 26, 24, 4); ctx.fill();
    ctx.fillStyle = '#5d3a17';
    ctx.fillRect(jx + 3, 250, 28, 9);
  });
  text(ctx, 'fresh daily', 465, 336, 15, '#8a6a45', 'center', 400);

  // A rail of hanging pans.
  ctx.fillStyle = '#4a4a52';
  ctx.fillRect(672, 224, 262, 8);
  [716, 800, 884].forEach((px, i) => {
    ctx.fillRect(px - 2, 232, 4, 26);
    ctx.fillStyle = '#33333c';
    ctx.beginPath(); ctx.arc(px, 292 + (i % 2) * 8, 30 - i * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#55555f';
    ctx.beginPath(); ctx.arc(px, 292 + (i % 2) * 8, 21 - i * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a4a52';
  });

  // The shop sign, painted on the wall.
  ctx.fillStyle = '#a33327';
  roundRect(ctx, 330, 392, 420, 56, 12); ctx.fill();
  ctx.fillStyle = '#ffd9a0';
  roundRect(ctx, 336, 398, 408, 44, 9); ctx.strokeStyle = '#ffd9a0'; ctx.stroke();
  text(ctx, 'SIZZLE STREET KITCHEN', 540, 421, 25, '#fff2d8', 'center', 800);
}

function drawClock(ctx, state) {
  const { x, y, r } = LAYOUT.clock;
  ctx.fillStyle = '#5d3a17';
  ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x + Math.sin(a) * (r - 10), y - Math.cos(a) * (r - 10), i % 3 === 0 ? 3.4 : 2, 0, Math.PI * 2);
    ctx.fill();
  }
  const mins = (state.time % 3600) / 60;
  const secs = state.time % 60;
  const hand = (angle, len, w, col) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * len, y - Math.cos(angle) * len); ctx.stroke();
  };
  hand((mins / 60) * Math.PI * 2, r * 0.62, 5, '#333');
  hand(((state.time % 43200) / 43200) * Math.PI * 2, r * 0.4, 7, '#333');
  hand((secs / 60) * Math.PI * 2, r * 0.8, 2, '#d43a2a');
  ctx.fillStyle = '#d43a2a';
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
}

function drawOrderBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#2e5d43';
  roundRect(ctx, 6, 58, b.cardW * 3 + b.gap * 2 + 16, b.cardH + 16, 10); ctx.fill();
  if (state.orders.length === 0) {
    text(ctx, 'all quiet... for now', 480, 130, 24, '#dcefe2', 'center', 700);
  }
  state.orders.forEach((order, i) => {
    const x = b.x + i * (b.cardW + b.gap);
    const y = b.y;
    ctx.fillStyle = '#fff8e8';
    roundRect(ctx, x, y, b.cardW, b.cardH, 8); ctx.fill();
    ctx.fillStyle = '#d43a2a';
    ctx.beginPath(); ctx.arc(x + b.cardW / 2, y + 7, 6, 0, Math.PI * 2); ctx.fill();
    if (i === 0) {
      ctx.strokeStyle = '#ffb52e'; ctx.lineWidth = 4;
      roundRect(ctx, x - 2, y - 2, b.cardW + 4, b.cardH + 4, 10); ctx.stroke();
      text(ctx, 'NEXT', x + b.cardW - 34, y + 18, 14, '#d4880a', 'center', 800);
    }
    text(ctx, order.recipe.name, x + 14, y + 20, 20, '#33241a', 'left', 800);
    text(ctx, `${order.recipe.price}c`, x + b.cardW - 14, y + 42, 15, '#8a6a45', 'right', 700);
    // The wanted stack, drawn as tiny layers.
    let cy = y + 96;
    const mini = [...order.recipe.stack].reverse();
    for (const id of mini) cy -= drawLayer(ctx, id, x + 42, cy, 62) * 0.62;
    // Ingredient names in two columns.
    ctx.font = '600 13px Verdana, sans-serif';
    order.recipe.stack.forEach((id, j) => {
      const col = j < 3 ? 0 : 1;
      const row = j % 3;
      text(ctx, INGREDIENT_BY_ID[id].name, x + 92 + col * 108, y + 52 + row * 19, 13, '#5d4a35', 'left', 600);
    });
    // Patience bar.
    const frac = Math.max(0, order.patience / order.patienceMax);
    ctx.fillStyle = '#e3d5bd';
    roundRect(ctx, x + 12, y + b.cardH - 18, b.cardW - 24, 10, 5); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#3f9e4d' : frac > 0.25 ? '#f0a02e' : '#d43a2a';
    roundRect(ctx, x + 12, y + b.cardH - 18, (b.cardW - 24) * frac, 10, 5); ctx.fill();
  });
}

function drawCustomer(ctx, state) {
  const hz = LAYOUT.hatch;
  ctx.fillStyle = '#5d3a17';
  roundRect(ctx, hz.x - 8, hz.y - 8, hz.w + 16, hz.h + 16, 10); ctx.fill();
  ctx.fillStyle = '#ffe9c9';
  roundRect(ctx, hz.x, hz.y, hz.w, hz.h, 6); ctx.fill();
  text(ctx, 'THE PASS', hz.x + hz.w / 2, hz.y + 18, 15, '#8a6a45', 'center', 800);
  const order = state.orders[0];
  if (!order) {
    text(ctx, 'no one waiting', hz.x + hz.w / 2, hz.y + 130, 18, '#a68a68', 'center', 600);
    return;
  }
  const cx = hz.x + hz.w / 2;
  const frac = Math.max(0, order.patience / order.patienceMax);
  const happy = state.flashT > 0 && state.flash.includes('COINS');
  ctx.fillStyle = SHIRT[order.face];
  roundRect(ctx, cx - 62, hz.y + 168, 124, 84, 26); ctx.fill();
  ctx.fillStyle = SKIN[order.face];
  ctx.beginPath(); ctx.arc(cx, hz.y + 108, 52, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = HAIR[order.face];
  ctx.beginPath(); ctx.arc(cx, hz.y + 92, 53, Math.PI * 1.02, Math.PI * 1.98); ctx.fill();
  ctx.fillRect(cx - 53, hz.y + 84, 106, 12);
  ctx.fillStyle = '#26221f';
  ctx.beginPath(); ctx.arc(cx - 19, hz.y + 108, 4.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 19, hz.y + 108, 4.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#26221f'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath();
  if (happy || frac > 0.5) ctx.arc(cx, hz.y + 122, 17, Math.PI * 0.15, Math.PI * 0.85);
  else if (frac > 0.25) { ctx.moveTo(cx - 13, hz.y + 136); ctx.lineTo(cx + 13, hz.y + 136); }
  else ctx.arc(cx, hz.y + 148, 15, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  if (frac <= 0.25 && !happy) {
    ctx.strokeStyle = '#d43a2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx + 40, hz.y + 66); ctx.lineTo(cx + 50, hz.y + 54); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 52, hz.y + 68); ctx.lineTo(cx + 62, hz.y + 58); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(240,120,110,.5)';
  ctx.beginPath(); ctx.arc(cx - 36, hz.y + 128, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 36, hz.y + 128, 8, 0, Math.PI * 2); ctx.fill();
  if (happy) text(ctx, 'YUM!', cx, hz.y + 44, 22, '#3f9e4d', 'center', 800);
}

function drawPlate(ctx, state) {
  const p = LAYOUT.plate;
  text(ctx, 'YOUR PLATE', p.x, 520, 16, '#ffd9a0', 'center', 800);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 16, p.r + 14, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 8, p.r + 10, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8e8de';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 6, p.r - 16, 16, 0, 0, Math.PI * 2); ctx.fill();
  let cy = p.y + 2;
  state.plate.forEach((id, i) => {
    cy -= drawLayer(ctx, id, p.x, cy, 168 - i * 3);
  });
  if (state.plate.length === 0) text(ctx, 'click the bins below', p.x, p.y - 26, 15, 'rgba(255,240,210,.75)', 'center', 600);
}

function drawPan(ctx, state, panStage) {
  const p = LAYOUT.pan;
  text(ctx, 'SIZZLE PAN', p.x, 520, 16, '#ffd9a0', 'center', 800);
  ctx.fillStyle = '#2c2c33';
  roundRect(ctx, p.x - 108, p.y - 62, 216, 140, 16); ctx.fill();
  ctx.strokeStyle = '#454550'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(p.x, p.y + 6, 62, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(p.x, p.y + 6, 40, 0, Math.PI * 2); ctx.stroke();
  // The skillet itself.
  ctx.fillStyle = '#1d1d22';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a3a42';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r - 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#141418';
  roundRect(ctx, p.x + p.r - 6, p.y - 11, 66, 22, 10); ctx.fill();
  const stage = panStage ? panStage() : null;
  if (state.pan) {
    const item = INGREDIENT_BY_ID[state.pan.id];
    const frac = state.pan.t / item.cook;
    if (state.pan.id === 'patty') {
      ctx.fillStyle = stage === 'burnt' ? '#191008' : frac < 0.5 ? '#a06a4a' : '#6e3f1e';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 58, 40, 0, 0, Math.PI * 2); ctx.fill();
    } else if (state.pan.id === 'egg') {
      ctx.fillStyle = stage === 'burnt' ? '#4a3a22' : '#fffdf4';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 56, 38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = stage === 'burnt' ? '#5d3a17' : '#ffb52e';
      ctx.beginPath(); ctx.arc(p.x, p.y, 19, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = stage === 'burnt' ? '#2a1a08' : frac < 0.5 ? '#f7e3b0' : '#e0aa54';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 58, 40, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Progress ring: grey while cooking, green in the ready window, red burnt.
    const total = item.cook * 1.45;
    ctx.strokeStyle = stage === 'ready' ? '#4dd45e' : stage === 'burnt' ? '#d43a2a' : '#c9c9c9';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, state.pan.t / total));
    ctx.stroke();
    const label = stage === 'ready' ? 'READY! click the pan' : stage === 'burnt' ? 'BURNT! click to scrape out' : 'sizzling...';
    text(ctx, label, p.x, p.y + 122, 16, stage === 'ready' ? '#7de787' : '#ffe9c9', 'center', 800);
  } else {
    text(ctx, 'patties, eggs & pancakes', p.x, p.y + 122, 14, 'rgba(255,240,210,.7)', 'center', 600);
  }
  for (const puff of state.steam) {
    ctx.fillStyle = `rgba(255,255,255,${0.35 * Math.max(0, puff.life)})`;
    ctx.beginPath(); ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawButtons(ctx) {
  const s = LAYOUT.serveBtn;
  ctx.fillStyle = '#2f9e4f';
  roundRect(ctx, s.x, s.y, s.w, s.h, 14); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  roundRect(ctx, s.x, s.y, s.w, 30, 14); ctx.fill();
  text(ctx, 'SERVE', s.x + s.w / 2, s.y + s.h / 2 - 8, 30, '#ffffff', 'center', 800);
  text(ctx, 'space', s.x + s.w / 2, s.y + s.h / 2 + 24, 14, '#d8f5de', 'center', 700);
  const t = LAYOUT.trashBtn;
  ctx.fillStyle = '#8a4a3a';
  roundRect(ctx, t.x, t.y, t.w, t.h, 12); ctx.fill();
  text(ctx, 'BIN PLATE', t.x + t.w / 2, t.y + t.h / 2, 19, '#ffe9c9', 'center', 800);
}

function drawHint(ctx, state) {
  const hz = LAYOUT.hint;
  ctx.fillStyle = 'rgba(38,22,12,.72)';
  roundRect(ctx, hz.x, hz.y, hz.w, hz.h, 10); ctx.fill();
  const order = state.orders[0];
  text(ctx, 'COOKING FOR THE NEXT ORDER', hz.x + 14, hz.y + 20, 13, '#ffb52e', 'left', 800);
  if (!order) {
    text(ctx, 'nothing on the board', hz.x + 14, hz.y + 52, 15, '#ffe9c9', 'left', 600);
    return;
  }
  text(ctx, order.recipe.name, hz.x + 14, hz.y + 46, 19, '#ffffff', 'left', 800);
  order.recipe.stack.forEach((id, i) => {
    const y = hz.y + 76 + i * 19;
    const done = state.plate[i] === id;
    text(ctx, done ? 'done' : 'todo', hz.x + 26, y, 12, done ? '#7de787' : '#c9b898', 'center', 800);
    drawLayer(ctx, id, hz.x + 66, y + 6, 44);
    text(ctx, INGREDIENT_BY_ID[id].name + (INGREDIENT_BY_ID[id].cook ? ' (pan first)' : ''), hz.x + 96, y, 13.5, done ? '#7de787' : '#ffe9c9', 'left', 600);
  });
}

function drawBins(ctx) {
  INGREDIENTS.forEach((item, i) => {
    const r = binRect(i);
    ctx.fillStyle = '#7a4a20';
    roundRect(ctx, r.x, r.y, r.w, r.h, 8); ctx.fill();
    ctx.fillStyle = '#96622c';
    roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 6); ctx.fill();
    drawLayer(ctx, item.id, r.x + r.w / 2, r.y + 44, 74);
    text(ctx, item.name, r.x + r.w / 2, r.y + 62, 12.5, '#ffe9c9', 'center', 700);
    ctx.fillStyle = '#33241a';
    roundRect(ctx, r.x + r.w / 2 - 13, r.y + 72, 26, 20, 5); ctx.fill();
    text(ctx, item.key, r.x + r.w / 2, r.y + 82, 13, '#ffd94d', 'center', 800);
    if (item.cook) text(ctx, 'PAN', r.x + r.w - 16, r.y + 14, 10.5, '#ffb52e', 'center', 800);
  });
}

function drawHud(ctx, state, best) {
  ctx.fillStyle = '#33241a';
  ctx.fillRect(0, 0, VIEW.width, LAYOUT.hudHeight);
  ctx.fillStyle = '#ffb52e';
  ctx.fillRect(0, LAYOUT.hudHeight - 4, VIEW.width, 4);
  text(ctx, `SCORE ${state.score}`, 22, 28, 23, '#ffffff', 'left', 800);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath(); ctx.arc(268, 28, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a8741a';
  text(ctx, 'c', 268, 29, 15, '#a8741a', 'center', 800);
  text(ctx, `${state.coins}`, 288, 28, 23, '#ffd94d', 'left', 800);
  if (state.combo > 1) text(ctx, `COMBO x${state.combo}`, 470, 28, 22, '#ff9d3c', 'left', 800);
  text(ctx, `LEVEL ${state.level}`, 720, 28, 21, '#aee2ff', 'left', 800);
  const mm = String(Math.floor(state.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(state.time % 60)).padStart(2, '0');
  text(ctx, `${mm}:${ss}`, 880, 28, 21, '#dcefe2', 'left', 700);
  for (let i = 0; i < 3; i += 1) {
    const hx = 1000 + i * 44;
    ctx.fillStyle = i < state.lives ? '#e5483c' : 'rgba(255,255,255,.18)';
    ctx.beginPath();
    ctx.moveTo(hx, 40);
    ctx.bezierCurveTo(hx - 20, 18, hx - 8, 6, hx, 16);
    ctx.bezierCurveTo(hx + 8, 6, hx + 20, 18, hx, 40);
    ctx.fill();
  }
  text(ctx, `BEST ${Math.max(best, state.score)}`, 1258, 28, 17, '#c9b898', 'right', 700);
}

function drawBurst(ctx, state) {
  for (const spark of state.burst) {
    ctx.fillStyle = `rgba(255,217,77,${Math.max(0, spark.life)})`;
    ctx.beginPath(); ctx.arc(spark.x, spark.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(168,116,26,${Math.max(0, spark.life)})`;
    text(ctx, 'c', spark.x, spark.y + 1, 11, `rgba(168,116,26,${Math.max(0, spark.life)})`, 'center', 800);
  }
  if (state.flashT > 0 && state.flash) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.flashT * 1.6);
    text(ctx, state.flash, 640, 300, 44, '#ffd94d', 'center', 800);
    ctx.restore();
  }
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(24,12,6,.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#a33327';
  roundRect(ctx, 240, 120, 800, 300, 22); ctx.fill();
  ctx.strokeStyle = '#ffd9a0'; ctx.lineWidth = 4;
  roundRect(ctx, 254, 134, 772, 272, 16); ctx.stroke();
  text(ctx, 'SIZZLE STREET', 640, 205, 64, '#fff2d8', 'center', 800);
  text(ctx, 'KITCHEN', 640, 272, 64, '#ffd94d', 'center', 800);
  text(ctx, 'Stack each order exactly as the board shows it.', 640, 336, 21, '#ffe9c9', 'center', 600);
  text(ctx, 'Patties, eggs and pancakes sizzle in the pan first - serve them golden, not burnt.', 640, 368, 19, '#ffe9c9', 'center', 600);
  ctx.fillStyle = '#2f9e4f';
  roundRect(ctx, 490, 448, 300, 64, 14); ctx.fill();
  text(ctx, 'CLICK TO OPEN', 640, 481, 24, '#ffffff', 'center', 800);
  text(ctx, 'click bins or press their keys - SPACE serves - P pauses', 640, 548, 17, '#ffd9a0', 'center', 600);
}

function drawOver(ctx, state, best) {
  ctx.fillStyle = 'rgba(24,12,6,.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff8e8';
  roundRect(ctx, 340, 150, 600, 400, 20); ctx.fill();
  ctx.fillStyle = '#d43a2a';
  ctx.beginPath(); ctx.arc(640, 150, 10, 0, Math.PI * 2); ctx.fill();
  text(ctx, 'KITCHEN CLOSED', 640, 216, 44, '#33241a', 'center', 800);
  text(ctx, 'the last customer has stormed out', 640, 258, 18, '#8a6a45', 'center', 600);
  const rows = [
    ['Orders served', String(state.served)],
    ['Customers lost', String(state.lost)],
    ['Best combo', `x${state.bestCombo}`],
    ['Coins earned', `${state.coins}c`],
    ['Final score', String(state.score)],
    ['Best score', String(Math.max(best, state.score))],
  ];
  rows.forEach((row, i) => {
    const y = 306 + i * 34;
    text(ctx, row[0], 420, y, 19, '#5d4a35', 'left', 600);
    text(ctx, row[1], 860, y, 19, '#33241a', 'right', 800);
  });
  ctx.fillStyle = '#2f9e4f';
  roundRect(ctx, 490, 574, 300, 60, 14); ctx.fill();
  text(ctx, 'REOPEN - CLICK', 640, 605, 22, '#ffffff', 'center', 800);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return {
    draw(state, screen, best, panStage) {
      ctx.clearRect(0, 0, VIEW.width, VIEW.height);
      drawKitchen(ctx, state);
      drawOrderBoard(ctx, state);
      drawClock(ctx, state);
      drawCustomer(ctx, state);
      drawPlate(ctx, state);
      drawPan(ctx, state, panStage);
      drawButtons(ctx);
      drawHint(ctx, state);
      drawBins(ctx);
      drawHud(ctx, state, best);
      drawBurst(ctx, state);
      if (screen === SCREEN_TITLE) drawTitle(ctx, state);
      else if (screen === SCREEN_OVER) drawOver(ctx, state, best);
      else if (screen === SCREEN_PAUSED) {
        ctx.fillStyle = 'rgba(24,12,6,.5)';
        ctx.fillRect(0, 0, VIEW.width, VIEW.height);
        text(ctx, 'PAUSED', 640, 400, 54, '#fff2d8', 'center', 800);
        text(ctx, 'press P to keep cooking', 640, 452, 20, '#ffd9a0', 'center', 600);
      }
    },
  };
}
