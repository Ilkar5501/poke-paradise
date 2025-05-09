// src/commands/add.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import crypto from 'crypto';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

/* ---------- defaults ---------- */
const DEFAULTS = {
  level: 100,
  nature: 'hardy',
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }
};

/**
 * Capitalizes the first letter of each type (e.g., "steel" -> "Steel")
 * @param {string[]} types - List of Pokémon types
 * @returns {string[]} - Capitalized types
 */
function capitalizeTypes(types) {
  return types.map(type => type.charAt(0).toUpperCase() + type.slice(1));
}

export default {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a Pokémon to your personal inventory')
    .addStringOption(o =>
      o.setName('query').setDescription('Name or Dex #').setRequired(true)),

  async execute(inter) {
    const base = getPokemon(inter.options.getString('query').toLowerCase());
    if (!base) return inter.reply('❌ Pokémon not found.');

    /* Enforce 50‑mon cap */
    const count = db.prepare(`
      SELECT COUNT(*) AS c FROM pokemon WHERE owner_id = ?
    `).get(inter.user.id).c;
    if (count >= 50)
      return inter.reply('❌ Your inventory is full (50).');

    /* Create new instance */
    const instId = crypto.randomUUID().slice(0, 8);
    const ivs = { ...DEFAULTS.ivs }; // Guaranteed 31 in every IV

    db.prepare(`
      INSERT INTO pokemon
        (instance_id, owner_id, dex_name, level, ivs, nature, moves)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      instId,
      inter.user.id,
      base.name,
      DEFAULTS.level,
      JSON.stringify(ivs),
      DEFAULTS.nature,
      '[]'  // empty moves
    );

    /* If this is their first Pokémon, auto-select it */
    const userHasActive = db.prepare(`
      SELECT active_pokemon FROM users WHERE discord_id = ?
    `).get(inter.user.id);

    if (!userHasActive) {
      db.prepare(`
        INSERT INTO users (discord_id, active_pokemon)
        VALUES (?, ?)
        ON CONFLICT(discord_id) DO UPDATE SET active_pokemon = excluded.active_pokemon
      `).run(inter.user.id, instId);
    }

    // Corrected Stat Calculation with Base Stats
    const stats = calcStats(base.baseStats, DEFAULTS.level, ivs, DEFAULTS.nature);
    const types = capitalizeTypes(base.types);

    const embed = new EmbedBuilder()
      .setTitle(`Added ${base.name.toUpperCase()} (ID ${instId})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Type', value: types.join(' | '), inline: false },
        { name: 'HP', value: `${stats.hp} (IV: ${ivs.hp}/31)`, inline: true },
        { name: 'ATTACK', value: `${stats.atk} (IV: ${ivs.atk}/31)`, inline: true },
        { name: 'DEFENSE', value: `${stats.def} (IV: ${ivs.def}/31)`, inline: true },
        { name: 'SP_ATTACK', value: `${stats.spa} (IV: ${ivs.spa}/31)`, inline: true },
        { name: 'SP_DEFENSE', value: `${stats.spd} (IV: ${ivs.spd}/31)`, inline: true },
        { name: 'SPEED', value: `${stats.spe} (IV: ${ivs.spe}/31)`, inline: true },
        { name: 'Nature', value: DEFAULTS.nature, inline: false }
      )
      .setColor(0x27e2a4);

    inter.reply({ embeds: [embed] });
  }
};
