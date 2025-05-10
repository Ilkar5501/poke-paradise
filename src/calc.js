// src/utils/calc.js
import { NATURES } from './nature.js';
import db from '../db.js';
import { getPokemon } from './pokedex.js';

// EV contribution per stat (252 EVs max)
const EV4 = Math.floor(252 / 4);

/**
 * Apply nature modifier: 1.1 for +1, 0.9 for -1, else 1
 */
function applyMod(value, mod) {
  if (mod ===  1) return Math.floor(value * 1.1);
  if (mod === -1) return Math.floor(value * 0.9);
  return value;
}

/**
 * Calculate raw stats given baseStats, level, ivs, and nature
 * @param {object} baseStats - raw HP, attack, defense, sp_attack, sp_defense, speed
 * @param {number} level
 * @param {object} ivs - ivs.hp, ivs.atk, ivs.def, ivs.spa, ivs.spd, ivs.spe
 * @param {string} nature
 * @returns {{ hp, attack, defense, sp_attack, sp_defense, speed }}
 */
export function calcStats(baseStats, level, ivs, nature) {
  const mods = NATURES[nature.toLowerCase()] || {};
  return {
    hp:         Math.floor(((2 * baseStats.hp         + ivs.hp  + EV4) * level) / 100) + level + 10,
    attack:    applyMod(Math.floor(((2 * baseStats.attack    + ivs.atk + EV4) * level) / 100) + 5, mods.attack),
    defense:   applyMod(Math.floor(((2 * baseStats.defense   + ivs.def + EV4) * level) / 100) + 5, mods.defense),
    sp_attack: applyMod(Math.floor(((2 * baseStats.sp_attack + ivs.spa + EV4) * level) / 100) + 5, mods.sp_attack),
    sp_defense:applyMod(Math.floor(((2 * baseStats.sp_defense+ ivs.spd + EV4) * level) / 100) + 5, mods.sp_defense),
    speed:     applyMod(Math.floor(((2 * baseStats.speed     + ivs.spe + EV4) * level) / 100) + 5, mods.speed),
  };
}

/**
 * Fetches stored data, base stats, and returns fully calculated stats
 * @param {string} instanceId
 * @returns {{ base, ivs, stats, level, nature }}
 */
export function getCalculatedStats(instanceId) {
  // Fetch from DB
  const row = db.prepare('SELECT * FROM pokemon WHERE instance_id = ?').get(instanceId);
  if (!row) throw new Error(`No Pokémon found with ID ${instanceId}`);

  // Lookup base data
  const base = getPokemon(row.dex_name);
  if (!base) throw new Error(`Base data missing for ${row.dex_name}`);

  // Parse IVs JSON & ensure defaults
  const ivs = JSON.parse(row.ivs);
  ['hp','atk','def','spa','spd','spe'].forEach(k => {
    if (typeof ivs[k] !== 'number') ivs[k] = 31;
  });

  // Calculate
  const stats = calcStats(base.baseStats, row.level, ivs, row.nature);
  return { base, ivs, stats, level: row.level, nature: row.nature };
}
