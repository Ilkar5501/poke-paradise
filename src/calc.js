// src/utils/calc.js
import { NATURES } from './nature.js';

const iv4 = Math.floor(252 / 4);

/**
 * @param {{ hp:number, attack:number, defense:number, sp_attack:number, sp_defense:number, speed:number }} baseStats
 * @param {number} level
 * @param {{ hp:number, atk:number, def:number, spa:number, spd:number, spe:number }} ivs
 * @param {string} nature
 * @returns {{ hp:number, atk:number, def:number, spa:number, spd:number, spe:number }}
 */
export function calcStats(baseStats, level, ivs, nature) {
  // exact mapping from your JSON keys → the short stat keys
  const keyMap = {
    hp:         'hp',
    attack:     'atk',
    defense:    'def',
    sp_attack:  'spa',
    sp_defense: 'spd',
    speed:      'spe',
  };

  const mods = NATURES[nature.toLowerCase()] || {};
  const out = {};

  for (const [baseKey, statKey] of Object.entries(keyMap)) {
    const B = baseStats[baseKey];
    const I = ivs[statKey];
    if (baseKey === 'hp') {
      // HP formula
      out.hp = Math.floor(((2 * B + I + iv4) * level) / 100) + level + 10;
    } else {
      // other stats
      let v = Math.floor(((2 * B + I + iv4) * level) / 100) + 5;
      if (mods[baseKey] ===  1) v = Math.floor(v * 1.1);
      if (mods[baseKey] === -1) v = Math.floor(v * 0.9);
      out[statKey] = v;
    }
  }

  return out;
}
