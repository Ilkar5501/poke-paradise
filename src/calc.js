// src/utils/calc.js
import { NATURES }      from './nature.js';
import db               from '../db.js';
import { getPokemon }   from './pokedex.js';

// EV contribution per stat (252 EVs max)
const EV4 = Math.floor(252 / 4);

/** Apply nature modifier */
function applyMod(value, mod) {
  if (mod ===  1) return Math.floor(value * 1.1);
  if (mod === -1) return Math.floor(value * 0.9);
  return value;
}

/** Pure stat calc */
export function calcStats(baseStats, level, ivs, nature) {
  const mods = NATURES[nature.toLowerCase()] || {};
  return {
    hp: Math.floor(((2*baseStats.hp   + ivs.hp   + EV4)*level)/100) + level + 10,
    attack:    applyMod(Math.floor(((2*baseStats.attack     + ivs.atk + EV4)*level)/100) + 5, mods.attack),
    defense:   applyMod(Math.floor(((2*baseStats.defense    + ivs.def + EV4)*level)/100) + 5, mods.defense),
    sp_attack: applyMod(Math.floor(((2*baseStats.sp_attack  + ivs.spa + EV4)*level)/100) + 5, mods.sp_attack),
    sp_defense:applyMod(Math.floor(((2*baseStats.sp_defense + ivs.spd + EV4)*level)/100) + 5, mods.sp_defense),
    speed:     applyMod(Math.floor(((2*baseStats.speed      + ivs.spe + EV4)*level)/100) + 5, mods.speed),
  };
}

/**
 * Fetch a Pokémon row by instance_id, combine with pokedex data,
 * and return { base, ivs, stats } in one call.
 */
export function getCalculatedStats(instanceId) {
  const row = db.prepare(`SELECT * FROM pokemon WHERE instance_id = ?`)
                .get(instanceId);
  if (!row) throw new Error(`No Pokémon with ID ${instanceId}`);
  
  const base = getPokemon(row.dex_name);
  if (!base) throw new Error(`Base data not found for ${row.dex_name}`);

  // parse IVs
  const ivs = JSON.parse(row.ivs);
  ['hp','atk','def','spa','spd','spe'].forEach(k => {
    if (typeof ivs[k] !== 'number') ivs[k] = 31;
  });

  const stats = calcStats(base.baseStats, row.level, ivs, row.nature);
  return { base, ivs, stats, level: row.level, nature: row.nature };
}
