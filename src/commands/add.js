import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import crypto from 'crypto';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

const LEVEL  = 100;
const NATURE = 'hardy';
const IVS    = { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 };

export default {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a Pokémon')
    .addStringOption(o => o.setName('query').setDescription('Name or Dex #').setRequired(true)),

  async execute(inter) {
    const query = inter.options.getString('query').toLowerCase();
    const base  = getPokemon(query);
    if (!base) return inter.reply('❌ Pokémon not found.');

    // Save instance to DB
    const instId = crypto.randomUUID().slice(0,8);
    db.prepare(
      `INSERT INTO pokemon (instance_id, owner_id, dex_name, level, ivs, nature, moves)
       VALUES (?, ?, ?, ?, ?, ?, '[]')`
    ).run(instId, inter.user.id, base.name, LEVEL, JSON.stringify(IVS), NATURE);

    // Auto-select default
    const user = db.prepare('SELECT active_pokemon FROM users WHERE discord_id=?').get(inter.user.id);
    if (!user) {
      db.prepare(
        `INSERT INTO users (discord_id, active_pokemon)
         VALUES (?,?) ON CONFLICT(discord_id)
         DO UPDATE SET active_pokemon=excluded.active_pokemon`
      ).run(inter.user.id, instId);
    }

    // Invoke calc.js purely with passed data
    const stats = calcStats(base.baseStats, LEVEL, IVS, NATURE);

    // Display
    const embed = new EmbedBuilder()
      .setTitle(`Added ${base.name.toUpperCase()} (ID ${instId})`)
      .setThumbnail(base.sprite)
      .addFields(
        { name:'HP',  value:`${stats.hp}`,  inline:true },
        { name:'ATK', value:`${stats.atk}`, inline:true },
        { name:'DEF', value:`${stats.def}`, inline:true },
        { name:'SPA', value:`${stats.spa}`, inline:true },
        { name:'SPD', value:`${stats.spd}`, inline:true },
        { name:'SPE', value:`${stats.spe}`, inline:true }
      )
      .setColor(0x27e2a4);

    await inter.reply({ embeds:[embed] });
  }
};
