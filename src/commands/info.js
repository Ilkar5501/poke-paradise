// src/commands/info.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getCalculatedStats } from '../utils/calc.js';

/** Capitalize Pokémon types */
function capitalizeTypes(types) {
  return types.map(t => t.charAt(0).toUpperCase() + t.slice(1));
}

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('View stats for your selected Pokémon'),

  async execute(inter) {
    // Fetch the user's active Pokémon instance ID
    const userRow = db.prepare(
      'SELECT active_pokemon AS id FROM users WHERE discord_id = ?'
    ).get(inter.user.id);
    if (!userRow || !userRow.id) {
      return inter.reply('❌ No active Pokémon selected.');
    }

    // Get all details and calculated stats
    let calc;
    try {
      calc = getCalculatedStats(userRow.id);
    } catch (err) {
      return inter.reply(`❌ ${err.message}`);
    }

    const { base, ivs, stats, level, nature } = calc;
    const types = capitalizeTypes(base.types);

    // Build and send the embed
    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} (Lv ${level})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Types',      value: types.join(' | '),                        inline: false },
        { name: 'HP',         value: `${stats.hp} (IV:${ivs.hp}/31)`,          inline: true },
        { name: 'ATTACK',     value: `${stats.attack} (IV:${ivs.atk}/31)`,      inline: true },
        { name: 'DEFENSE',    value: `${stats.defense} (IV:${ivs.def}/31)`,     inline: true },
        { name: 'SP_ATTACK',  value: `${stats.sp_attack} (IV:${ivs.spa}/31)`,   inline: true },
        { name: 'SP_DEFENSE', value: `${stats.sp_defense} (IV:${ivs.spd}/31)`,  inline: true },
        { name: 'SPEED',      value: `${stats.speed} (IV:${ivs.spe}/31)`,       inline: true },
        { name: 'Nature',     value: nature,                                   inline: false }
      )
      .setColor(0x27e2a4);

    return inter.reply({ embeds: [embed] });
  }
};
