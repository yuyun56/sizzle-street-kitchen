// Sizzle Street Kitchen — shared constants: the playfield, the pantry, the recipes
// and the layout numbers the renderer and the input handler both measure from.

export const VIEW = { width: 1280, height: 800 };
export const STEP = 1 / 60;
export const BEST_KEY = 'sizzle-street-best';

export const LIVES_START = 3;
export const ORDERS_MAX = 3;
export const SERVES_PER_LEVEL = 5;

// Cooking windows, in seconds on the pan. An item is ready between READY_FROM and
// READY_UNTIL of its cook time; past BURNT_AT it is charcoal and only fit for the bin.
export const COOK = { readyFrom: 0.55, readyUntil: 1.0, burntAt: 1.45 };

// The pantry. `cook` is the pan time in seconds for things that must sizzle first,
// or 0 for things that go straight onto the plate. `key` is the keyboard shortcut
// shown on the bin. Colours are the base tone the renderer shades from.
export const INGREDIENTS = [
  { id: 'bun-bottom', name: 'Bun Base', key: '1', cook: 0, color: '#e8b06a' },
  { id: 'patty', name: 'Beef Patty', key: '2', cook: 4.2, color: '#7a4a26' },
  { id: 'cheese', name: 'Cheese', key: '3', cook: 0, color: '#ffb52e' },
  { id: 'lettuce', name: 'Lettuce', key: '4', cook: 0, color: '#69c24a' },
  { id: 'tomato', name: 'Tomato', key: '5', cook: 0, color: '#e5483c' },
  { id: 'onion', name: 'Onion', key: '6', cook: 0, color: '#d9c8e8' },
  { id: 'egg', name: 'Egg', key: '7', cook: 3.4, color: '#ffd94d' },
  { id: 'toast', name: 'Toast', key: '8', cook: 0, color: '#d99a4e' },
  { id: 'pancake', name: 'Pancake', key: '9', cook: 3.0, color: '#eec27f' },
  { id: 'berries', name: 'Berries', key: '0', cook: 0, color: '#7a4fd0' },
  { id: 'cream', name: 'Cream', key: 'Q', cook: 0, color: '#fff6ea' },
  { id: 'bun-top', name: 'Bun Top', key: 'W', cook: 0, color: '#eda855' },
];
export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((item) => [item.id, item]));

// The menu. Each recipe is the exact stack, bottom first, that the customer wants.
export const RECIPES = [
  { name: 'Classic Burger', price: 42, stack: ['bun-bottom', 'patty', 'cheese', 'lettuce', 'tomato', 'bun-top'] },
  { name: 'Cheese Melt', price: 36, stack: ['bun-bottom', 'patty', 'cheese', 'onion', 'bun-top'] },
  { name: 'Garden Burger', price: 38, stack: ['bun-bottom', 'lettuce', 'tomato', 'onion', 'cheese', 'bun-top'] },
  { name: 'Sunny Plate', price: 30, stack: ['toast', 'egg', 'cheese', 'tomato'] },
  { name: 'Berry Pancakes', price: 34, stack: ['pancake', 'cream', 'pancake', 'berries'] },
  { name: 'Egg Stack', price: 40, stack: ['toast', 'egg', 'patty', 'cheese'] },
  { name: 'Double Smash Burger', price: 52, stack: ['bun-bottom', 'patty', 'cheese', 'patty', 'cheese', 'onion', 'bun-top'] },
];

// Layout, shared by drawing and clicking. The counter runs along the bottom: the
// plate on the left, the pan in the middle, the pass and the bin on the right,
// and the ingredient bins in one long row underneath them.
export const LAYOUT = {
  hudHeight: 56,
  board: { x: 14, y: 66, cardW: 306, cardH: 128, gap: 12 },
  clock: { x: 1142, y: 130, r: 50 },
  hatch: { x: 972, y: 208, w: 294, h: 252 },
  plate: { x: 252, y: 612, r: 104 },
  pan: { x: 566, y: 606, r: 88 },
  serveBtn: { x: 762, y: 512, w: 178, h: 84 },
  trashBtn: { x: 762, y: 612, w: 178, h: 58 },
  hint: { x: 972, y: 486, w: 294, h: 190 },
  bins: { x: 8, y: 692, w: 102, h: 100, gap: 4 },
};

export function binRect(index) {
  const b = LAYOUT.bins;
  return { x: b.x + index * (b.w + b.gap), y: b.y, w: b.w, h: b.h };
}
