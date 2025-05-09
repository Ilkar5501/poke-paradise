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

    // Calculate total IV percentage
    const totalIV = Object.values(ivs).reduce((sum, val) => sum + val, 0);
    const totalIVPercent = ((totalIV / 186) * 100).toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle(`${row.dex_name} (ID: ${row.instance_id})`)
      .setDescription(`Level ${row.level} "${row.dex_name}"`)
      .addFields(
        { name: 'Types', value: base.types.join(' | '), inline: false },
        { name: 'Nature', value: row.nature.charAt(0).toUpperCase() + row.nature.slice(1), inline: false },
        { name: 'HP', value: `**${stats.hp}** - EV: 252 - IV: ${ivs.hp}/31`, inline: true },
        { name: 'Attack', value: `**${stats.atk}** - EV: 252 - IV: ${ivs.atk}/31`, inline: true },
        { name: 'Defense', value: `**${stats.def}** - EV: 252 - IV: ${ivs.def}/31`, inline: true },
        { name: 'Sp. Atk', value: `**${stats.spa}** - EV: 252 - IV: ${ivs.spa}/31`, inline: true },
        { name: 'Sp. Def', value: `**${stats.spd}** - EV: 252 - IV: ${ivs.spd}/31`, inline: true },
        { name: 'Speed', value: `**${stats.spe}** - EV: 252 - IV: ${ivs.spe}/31`, inline: true },
        { name: 'Total IV %', value: `${totalIVPercent}%`, inline: false }
      )
      .setThumbnail(base.sprite)
      .setColor(0x27e2a4)
      .setFooter({ text: `Displaying Pokémon: ${row.instance_id}` });

    inter.reply({ embeds: [embed] });
  }
};
