// src/commands/info.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

export default {
  data: new SlashCommandBuilder().setName('info').setDescription('View stats'),

  async execute(inter) {
    const sel = db.prepare('SELECT active_pokemon FROM users WHERE discord_id=?').get(inter.user.id);
    if (!sel) return inter.reply('❌ No active Pokémon selected.');

    const row = db.prepare('SELECT * FROM pokemon WHERE instance_id=?').get(sel.active_pokemon);
    const base = getPokemon(row.dex_name);
    if (!base) return inter.reply('❌ Base data missing.');

    const ivs   = JSON.parse(row.ivs);
    const stats = calcStats(base.baseStats, row.level, ivs, row.nature);

    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} (Lv ${row.level})`)
      .addFields(
        { name:'HP',  value:`${stats.hp}`,  inline:true },
        { name:'ATK', value:`${stats.atk}`,inline:true },
        { name:'DEF', value:`${stats.def}`,inline:true },
        { name:'SPA', value:`${stats.spa}`,inline:true },
        { name:'SPD', value:`${stats.spd}`,inline:true },
        { name:'SPE', value:`${stats.spe}`,inline:true }
      )
      .setColor(0x27e2a4);

    await inter.reply({ embeds:[embed] });
  }
};
