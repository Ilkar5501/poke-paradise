// src/commands/info.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('View stats for your currently selected Pokémon'),

  async execute(inter) {
    const sel = db.prepare(`
      SELECT active_pokemon FROM users WHERE discord_id = ?
    `).get(inter.user.id);

    if (!sel)
      return inter.reply('❌ You haven’t selected a Pokémon (`/select`).');

    const row = db.prepare(`
      SELECT * FROM pokemon WHERE instance_id = ?
    `).get(sel.active_pokemon);

    const base = getPokemon(row.dex_name);
    if (!base)
      return inter.reply('❌ Error: Base Pokémon data not found.');

    const ivs = JSON.parse(row.ivs);
    const stats = calcStats(base.baseStats, row.level, ivs, row.nature);

    const embed = new EmbedBuilder()
      .setTitle(`${row.dex_name} (ID: ${row.instance_id})`)
      .setDescription(`Level ${row.level} "${row.dex_name}"`)
      .addFields(
        { name: 'Types', value: base.types.join(' | '), inline: false },
        ...Object.entries(stats).map(([k, v]) =>
          ({ name: k.toUpperCase(), value: `${v} (IV: ${ivs[k]}/31)`, inline: true }))
      )
      .setThumbnail(base.sprite)
      .setColor(0x27e2a4);

    inter.reply({ embeds: [embed] });
  }
};
