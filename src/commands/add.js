// src/commands/add.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import crypto from 'crypto';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

const LEVEL       = 100;
const NATURE      = 'hardy';
const DEFAULT_IVS = { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 };

function capitalizeTypes(types) {
  return types.map(t => t.charAt(0).toUpperCase() + t.slice(1));
}

export default {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a Pokémon to your inventory')
    .addStringOption(o =>
      o.setName('query')
       .setDescription('Pokémon name or Dex #')
       .setRequired(true)
    ),

  async execute(inter) {
    const q    = inter.options.getString('query').toLowerCase();
    const base = getPokemon(q);
    if (!base) return inter.reply('❌ Pokémon not found.');

    // Persist new Pokémon
    const instId = crypto.randomUUID().slice(0,8);
    db.prepare(`
      INSERT INTO pokemon
        (instance_id, owner_id, dex_name, level, ivs, nature, moves)
      VALUES (?, ?, ?, ?, ?, ?, '[]')
    `).run(
      instId,
      inter.user.id,
      base.name,
      LEVEL,
      JSON.stringify(DEFAULT_IVS),
      NATURE
    );

    // Auto-select if first
    const existing = db.prepare(
      'SELECT active_pokemon FROM users WHERE discord_id = ?'
    ).get(inter.user.id);
    if (!existing) {
      db.prepare(`
        INSERT INTO users (discord_id, active_pokemon)
        VALUES (?, ?)
        ON CONFLICT(discord_id) DO UPDATE
          SET active_pokemon = excluded.active_pokemon
      `).run(inter.user.id, instId);
    }

    // Calculate stats via calc.js
    const stats = calcStats(base.baseStats, LEVEL, DEFAULT_IVS, NATURE);

    // Build embed
    const types = capitalizeTypes(base.types);
    const ivs   = DEFAULT_IVS;
    const embed = new EmbedBuilder()
      .setTitle(`Added ${base.name.toUpperCase()} (ID ${instId})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Type',       value: types.join(' | '),           inline: false },
        { name: 'HP',         value: `${stats.hp} (IV:${ivs.hp}/31)`, inline: true },
        { name: 'ATTACK',     value: `${stats.atk} (IV:${ivs.atk}/31)`, inline: true },
        { name: 'DEFENSE',    value: `${stats.def} (IV:${ivs.def}/31)`, inline: true },
        { name: 'SP_ATTACK',  value: `${stats.spa} (IV:${ivs.spa}/31)`, inline: true },
        { name: 'SP_DEFENSE', value: `${stats.spd} (IV:${ivs.spd}/31)`, inline: true },
        { name: 'SPEED',      value: `${stats.spe} (IV:${ivs.spe}/31)`, inline: true },
        { name: 'Nature',     value: NATURE,                       inline: false }
      )
      .setColor(0x27e2a4);

    await inter.reply({ embeds: [embed] });
  }
};
