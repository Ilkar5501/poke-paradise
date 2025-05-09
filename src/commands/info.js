// src/commands/info.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

function capitalizeTypes(types) {
  return types.map(t => t.charAt(0).toUpperCase() + t.slice(1));
}

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('View stats for your selected Pokémon'),

  async execute(inter) {
    // Grab user’s active Pokémon in one join
    const row = db.prepare(`
      SELECT p.* 
      FROM pokemon p
      JOIN users u ON u.active_pokemon = p.instance_id
      WHERE u.discord_id = ?
    `).get(inter.user.id);
    if (!row) return inter.reply('❌ No active Pokémon selected.');

    const base = getPokemon(row.dex_name);
    if (!base) return inter.reply('❌ Base data missing.');

    // Parse IVs & default missing
    const ivs = JSON.parse(row.ivs);
    ['hp','atk','def','spa','spd','spe'].forEach(k => {
      if (typeof ivs[k] !== 'number') ivs[k] = 31;
    });

    // Calculate stats via calc.js
    const stats = calcStats(base.baseStats, row.level, ivs, row.nature);

    // Build embed
    const types = capitalizeTypes(base.types);
    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} (Lv ${row.level})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Types',      value: types.join(' | '),           inline: false },
        { name: 'HP',         value: `${stats.hp} (IV:${ivs.hp}/31)`, inline: true },
        { name: 'ATTACK',     value: `${stats.atk} (IV:${ivs.atk}/31)`, inline: true },
        { name: 'DEFENSE',    value: `${stats.def} (IV:${ivs.def}/31)`, inline: true },
        { name: 'SP_ATTACK',  value: `${stats.spa} (IV:${ivs.spa}/31)`, inline: true },
        { name: 'SP_DEFENSE', value: `${stats.spd} (IV:${ivs.spd}/31)`, inline: true },
        { name: 'SPEED',      value: `${stats.spe} (IV:${ivs.spe}/31)`, inline: true },
        { name: 'Nature',     value: row.nature,                   inline: false }
      )
      .setColor(0x27e2a4);

    await inter.reply({ embeds: [embed] });
  }
};
