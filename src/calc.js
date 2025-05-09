// src/utils/calc.js
import { NATURES } from './nature.js';

/* EVs are fixed at 252 per stat → iv4 = 63 */
const iv4 = 63; // 252 EVs / 4 = 63

/**
 * Calculates Pokémon stats
 * @param {object} base - Base stats of the Pokémon
 * @param {number} lvl - Pokémon level
 * @param {object} ivs - Individual Values (IVs)
 * @param {string} nature - Pokémon nature
 * @returns {object} - Calculated stats
 */
export const calcStats = (base, lvl, ivs, nature) => {
  const nMod = NATURES[nature] || {};
  const out = {};

  for (const [stat, b] of Object.entries(base)) {
    if (stat === 'hp') {
      out.hp = Math.floor(((2 * b + ivs.hp + iv4) * lvl) / 100) + lvl + 10;
    } else {
      let val = Math.floor(((2 * b + ivs[stat] + iv4) * lvl) / 100) + 5;
      if (nMod[stat] === 1) val = Math.floor(val * 1.1);   // boosted
      if (nMod[stat] === -1) val = Math.floor(val * 0.9);  // lowered
      out[stat] = val;
    }
  }

  return out;
};
