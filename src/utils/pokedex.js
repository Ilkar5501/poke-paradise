// src/utils/pokedex.js
import { readFileSync } from 'fs';
import { NATURES } from './nature.js';

/* Load all Pokémon data from pokedex.json */
const data = JSON.parse(readFileSync('data/pokedex.json'));

/* Quick lookup maps (by name and by Dex ID) */
export const byName = data;
export const byId = Object.fromEntries(
  Object.values(data).map(p => [String(p.id), p])
);

/**
 * Retrieves a Pokémon by name or Dex number.
 * @param {string} q - Name or Dex number.
 * @returns {object|null} - Pokémon data.
 */
export function getPokemon(q) {
  q = q.toLowerCase();
  return byName[q] || byId[q] || null;
}

/**
 * Calculates the full stats of a Pokémon based on its base stats, level, IVs, and nature.
 * @param {object} base - Base stats of the Pokémon (HP, Atk, Def, SpA, SpD, Spe).
 * @param {number} lvl - Pokémon level (always 100 in this bot).
 * @param {object} ivs - IV values for each stat (0-31).
 * @param {string} nature - Nature of the Pokémon (affects stats).
 * @returns {object} - Calculated stats (HP, Atk, Def, SpA, SpD, Spe).
 */
export const calcStats = (base, lvl, ivs, nature) => {
  const nMod = NATURES[nature] || {};
  const iv4 = 63;     // floor(252 / 4) → EVs are fixed at 252 per stat

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
