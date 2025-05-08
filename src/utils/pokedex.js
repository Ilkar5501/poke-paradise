import { NATURES } from './nature.js';

/* EVs are fixed at 252 per stat → iv4 = 63 */
const iv4 = 63;     // floor(252 / 4)

export const calcStats = (base, lvl, ivs, nature) => {
  const nMod = NATURES[nature] || {};

  const out = {};
  for (const [stat, b] of Object.entries(base)) {
    if (stat === 'hp') {
      out.hp = Math.floor(((2 * b + ivs.hp + iv4) * lvl) / 100) + lvl + 10;
    } else {
      let val = Math.floor(((2 * b + ivs[stat] + iv4) * lvl) / 100) + 5;
      if (nMod[stat] === 1)  val = Math.floor(val * 1.1);   // boosted
      if (nMod[stat] === -1) val = Math.floor(val * 0.9);   // lowered
      out[stat] = val;
    }
  }
  return out;
};
