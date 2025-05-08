/* 25 canonical natures. Keys are stat names used in pokedex.json:
   hp, atk, def, spa, spd, spe
   For neutral natures we use an empty object.
   For others:  1  = 10 % boost   –1 = 10 % drop
*/
export const NATURES = {
  hardy: {},
  lonely:  { atk: 1,  def: -1 },
  brave:   { atk: 1,  spe: -1 },
  adamant: { atk: 1,  spa: -1 },
  naughty: { atk: 1,  spd: -1 },

  bold:    { def: 1,  atk: -1 },
  docile: {},
  relaxed: { def: 1,  spe: -1 },
  impish:  { def: 1,  spa: -1 },
  lax:     { def: 1,  spd: -1 },

  timid:   { spe: 1,  atk: -1 },
  hasty:   { spe: 1,  def: -1 },
  serious: {},
  jolly:   { spe: 1,  spa: -1 },
  naive:   { spe: 1,  spd: -1 },

  modest:  { spa: 1,  atk: -1 },
  mild:    { spa: 1,  def: -1 },
  quiet:   { spa: 1,  spe: -1 },
  bashful: {},
  rash:    { spa: 1,  spd: -1 },

  calm:    { spd: 1,  atk: -1 },
  gentle:  { spd: 1,  def: -1 },
  sassy:   { spd: 1,  spe: -1 },
  careful: { spd: 1,  spa: -1 },
  quirky:  {}
};

/* quick helper */
export const isNature = (n) => Object.prototype.hasOwnProperty.call(NATURES, n);
