import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

/* Utility: Capitalizes Pokémon types */
function capitalizeTypes(types) {
  return types.map(type => type.charAt(0).toUpperCase() + type.slice(1));
}

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

    // Ensure IVs exist
    const ivs = JSON.parse(row.ivs);
    const ivFields = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    ivFields.forEach(stat => {
      if (typeof ivs[stat] === 'undefined') ivs[stat] = 31; // Default to 31 IV
    });

    // Calculate stats using calcStats
    const stats = calcStats(base.baseStats, row.level, ivs, row.nature);
    const types = capitalizeTypes(base.types);

    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} (ID: ${row.instance_id})`)
      .setDescription(`Level ${row.level} "${row.dex_name}"`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Types', value: types.join(' | '), inline: false },
        { name: 'HP', value: `${stats.hp} (IV: ${ivs.hp}/31)`, inline: true },
        { name: 'ATTACK', value: `${stats.atk} (IV: ${ivs.atk}/31)`, inline: true },
        { name: 'DEFENSE', value: `${stats.def} (IV: ${ivs.def}/31)`, inline: true },
        { name: 'SP_ATTACK', value: `${stats.spa} (IV: ${ivs.spa}/31)`, inline: true },
        { name: 'SP_DEFENSE', value: `${stats.spd} (IV: ${ivs.spd}/31)`, inline: true },
        { name: 'SPEED', value: `${stats.spe} (IV: ${ivs.spe}/31)`, inline: true },
        { name: 'Nature', value: row.nature, inline: false }
      )
      .setColor(0x27e2a4);

    inter.reply({ embeds: [embed] });
  }
};
