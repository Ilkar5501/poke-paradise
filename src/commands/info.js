// src/commands/info.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getCalculatedStats } from '../utils/calc.js';

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('View stats for your selected Pokémon'),

  async execute(inter) {
    // Join users → pokemon inside getCalculatedStats
    const row = db.prepare(`
      SELECT p.instance_id
      FROM users u
      JOIN pokemon p ON p.instance_id = u.active_pokemon
      WHERE u.discord_id = ?
    `).get(inter.user.id);
    if (!row) return inter.reply('❌ No active Pokémon selected.');

    const { base, ivs, stats } = getCalculatedStats(row.instance_id);

    const types = base.types.map(t => t[0].toUpperCase() + t.slice(1));
    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} (Lv ${stats.level || 100})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Type',       value: types.join(' | '),                       inline: false },
        { name: 'HP',         value: `${stats.hp} (IV:${ivs.hp}/31)`,         inline: true },
        { name: 'ATTACK',     value: `${stats.attack} (IV:${ivs.atk}/31)`,     inline: true },
        { name: 'DEFENSE',    value: `${stats.defense} (IV:${ivs.def}/31)`,    inline: true },
        { name: 'SP_ATTACK',  value: `${stats.sp_attack} (IV:${ivs.spa}/31)`,  inline: true },
        { name: 'SP_DEFENSE', value: `${stats.sp_defense} (IV:${ivs.spd}/31)`, inline: true },
        { name: 'SPEED',      value: `${stats.speed} (IV:${ivs.spe}/31)`,      inline: true },
        { name: 'Nature',     value: base.nature || 'hardy',                  inline: false }
      )
      .setColor(0x27e2a4);

    await inter.reply({ embeds: [embed] });
  }
};
