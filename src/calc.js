// src/utils/calc.js
import { NATURES } from './nature.js';

// EV contribution per stat
const EV4 = Math.floor(252 / 4);

/**
 * Calculate HP with standard formula
 * @param {{ hp:number }} baseStats
 * @param {number} level
 * @param {{ hp:number }} ivs
 */
export function calcHP(baseStats, level, ivs) {
  return Math.floor(((2 * baseStats.hp + ivs.hp + EV4) * level) / 100) + level + 10;
}

/**
 * Calculate non-HP stat with nature modifier
 * @param {{}} baseStats
 * @param {string} key    // e.g. 'attack', 'sp_attack'
 * @param {number} level
 * @param {{}} ivs
 * @param {function} modFn // function(baseStats, ivs, level) => raw stat before nature
 * @param {number} natureMod
 */
export function calcOther(baseStats, key, level, ivs, natureMod) {
  const raw = Math.floor(((2 * baseStats[key] + ivs[key === 'attack'? 'atk'
    : key === 'defense'? 'def'
    : key === 'sp_attack'? 'spa'
    : key === 'sp_defense'? 'spd'
    : 'spe'] + EV4) * level) / 100) + 5;
  if (natureMod === 1)  return Math.floor(raw * 1.1);
  if (natureMod === -1) return Math.floor(raw * 0.9);
  return raw;
}

/**
 * Calculate all stats via calcHP & calcOther
 */
export function calcStats(baseStats, level, ivs, nature) {
  const mods = NATURES[nature.toLowerCase()] || {};
  return {
    hp : calcHP(baseStats, level, ivs),
    atk: calcOther(baseStats, 'attack',    level, ivs, mods.attack),
    def: calcOther(baseStats, 'defense',   level, ivs, mods.defense),
    spa: calcOther(baseStats, 'sp_attack', level, ivs, mods.sp_attack),
    spd: calcOther(baseStats, 'sp_defense',level, ivs, mods.sp_defense),
    spe: calcOther(baseStats, 'speed',     level, ivs, mods.speed)
  };
}
