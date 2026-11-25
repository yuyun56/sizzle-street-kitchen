// Hands and keys: turns pointer presses and keystrokes into a small queue the
// game loop drains each frame. Coordinates are converted from CSS pixels into
// the game's fixed 1280x800 space, so a click lands where it looks like it
// lands whatever size the window is.

import { VIEW } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;

export function createInput(canvas) {
  const clicks = [];
  let actions = 0;
  let keyPress = '';

  function toGame(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW.width,
      y: ((clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    const point = toGame(event.clientX, event.clientY);
    clicks.push(point);
    actions |= ACTION_CONFIRM;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      actions |= ACTION_CONFIRM | ACTION_SERVE;
      keyPress = 'serve';
      event.preventDefault();
    } else if (key === 'p' || key === 'escape') {
      actions |= ACTION_PAUSE;
    } else if (key.length === 1) {
      keyPress = key;
    }
  });

  return {
    /** Drain the click queue. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    /** Drain the action flags (confirm / pause / serve). */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The last single-character key pressed, upper-cased, or ''. */
    takeKey() {
      const taken = keyPress;
      keyPress = '';
      return taken.toUpperCase();
    },
  };
}
