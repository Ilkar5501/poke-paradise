// src/commands/add.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import crypto from 'crypto';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

/* ---------- defaults ---------- */
const DEFAULTS = {
  level  : 100,
  nature : 'hardy',
  ivs    : { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 }
};

export default {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a Pokémon to your personal inventory')
    .addStringOption(o =>
      o.setName('query').setDescription('Name or Dex #').setRequired(true)),

  async execute(inter) {
    const base = getPokemon(inter.options.getString('query').toLowerCase());
    if (!base) return inter.reply('❌ Pokémon not found.');

    /* enforce 50‑mon cap */
    const count = db.prepare(`
      SELECT COUNT(*) AS c FROM pokemon WHERE owner_id = ?
    `).get(inter.user.id).c;
    if (count >= 50)
      return inter.reply('❌ Your inventory is full (50).');

    /* create new instance */
    const instId = crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO pokemon
        (instance_id, owner_id, dex_name, level, ivs, nature, moves)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      instId,
      inter.user.id,
      base.name,
      DEFAULTS.level,
      JSON.stringify(DEFAULTS.ivs),
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

    /* build stats for the embed */
    const stats = calcStats(base.baseStats, DEFAULTS.level, DEFAULTS.ivs, DEFAULTS.nature);

    const embed = new EmbedBuilder()
      .setTitle(`Added ${base.name.toUpperCase()} (ID ${instId})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Type', value: base.types.join(' | '), inline: false },
        ...Object.entries(stats).map(([k, v]) =>
          ({ name: k.toUpperCase(), value: String(v), inline: true })),
        { name: 'Nature', value: DEFAULTS.nature, inline: true }
      )
      .setColor(0x27e2a4);

    inter.reply({ embeds: [embed] });
  }
};
