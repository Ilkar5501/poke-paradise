// src/commands/add.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import crypto from 'crypto';
import db from '../db.js';
import { getCalculatedStats } from '../utils/calc.js';

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
    const q = inter.options.getString('query').toLowerCase();
    const instId = crypto.randomUUID().slice(0,8);

    db.prepare(`
      INSERT INTO pokemon
        (instance_id, owner_id, dex_name, level, ivs, nature, moves)
      VALUES (?, ?, ?, 100, '{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31}', 'hardy', '[]')
    `).run(instId, inter.user.id, q);

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

    const { base, ivs, stats } = getCalculatedStats(instId);
    const types = base.types.map(t => t[0].toUpperCase() + t.slice(1));

    const embed = new EmbedBuilder()
      .setTitle(`Added ${base.name.toUpperCase()} (ID ${instId})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Type',       value: types.join(' | '),                       inline: false },
        { name: 'HP',         value: `${stats.hp} (IV:${ivs.hp}/31)`,         inline: true },
        { name: 'ATTACK',     value: `${stats.attack} (IV:${ivs.atk}/31)`,     inline: true },
        { name: 'DEFENSE',    value: `${stats.defense} (IV:${ivs.def}/31)`,    inline: true },
        { name: 'SP_ATTACK',  value: `${stats.sp_attack} (IV:${ivs.spa}/31)`,  inline: true },
        { name: 'SP_DEFENSE', value: `${stats.sp_defense} (IV:${ivs.spd}/31)`, inline: true },
        { name: 'SPEED',      value: `${stats.speed} (IV:${ivs.spe}/31)`,      inline: true },
        { name: 'Nature',     value: base.nature,                             inline: false }
      )
      .setColor(0x27e2a4);

    await inter.reply({ embeds: [embed] });
  }
};
