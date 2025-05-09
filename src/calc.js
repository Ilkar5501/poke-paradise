// src/utils/calc.js
import { NATURES } from './nature.js';

/* EVs are fixed at 252 per stat → iv4 = 63 */
const iv4 = Math.floor(252 / 4); // 63

/**
 * Calculates Pokémon stats using the standard formula
 * @param {object} base - Base stats of the Pokémon
 * @param {number} level - Pokémon level
 * @param {object} ivs - Individual Values (IVs)
 * @param {string} nature - Pokémon nature
 * @returns {object} - Calculated stats
 */
export const calcStats = (base, level, ivs, nature) => {
  const nMod = NATURES[nature.toLowerCase()] || {}; // Get nature modifiers
  const stats = {};

  for (const [stat, baseValue] of Object.entries(base)) {
    if (stat === 'hp') {
      // HP is calculated differently
      stats.hp = Math.floor(((2 * baseValue + ivs.hp + iv4) * level) / 100) + level + 10;
    } else {
      // Non-HP stats
      let value = Math.floor(((2 * baseValue + ivs[stat] + iv4) * level) / 100) + 5;

      // Apply nature modifier (if any)
      if (nMod[stat] === 1) value = Math.floor(value * 1.1); // Boosted
      if (nMod[stat] === -1) value = Math.floor(value * 0.9); // Lowered

      stats[stat] = value;
    }
  }

  return stats;
};

/**
 * Example Usage (for testing):
 * const baseStats = { hp: 100, atk: 120, def: 120, spa: 150, spd: 100, spe: 90 };
 * const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
 * console.log(calcStats(baseStats, 100, ivs, 'hardy'));
 */
