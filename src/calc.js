import { NATURES } from './nature.js';

const iv4 = Math.floor(252 / 4);

export const calcStats = (base, level, ivs, nature) => {
  const nMod = NATURES[nature.toLowerCase()] || {};

  // HP formula
  const hp = Math.floor(((2 * base.hp + ivs.hp + iv4) * level) / 100) + level + 10;

  // Helper to calc non‑HP stats
  function oneStat(baseVal, ivVal, modKey) {
    let val = Math.floor(((2 * baseVal + ivVal + iv4) * level) / 100) + 5;
    if (nMod[modKey] ===  1) val = Math.floor(val * 1.1);
    if (nMod[modKey] === -1) val = Math.floor(val * 0.9);
    return val;
  }

  return {
    hp,
    atk: oneStat(base.attack,     ivs.atk, 'attack'),
    def: oneStat(base.defense,    ivs.def, 'defense'),
    spa: oneStat(base.sp_attack,  ivs.spa, 'sp_attack'),
    spd: oneStat(base.sp_defense, ivs.spd, 'sp_defense'),
    spe: oneStat(base.speed,      ivs.spe, 'speed'),
  };
};
