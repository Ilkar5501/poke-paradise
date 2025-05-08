import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';
import { isNature } from '../utils/nature.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nature')
    .setDescription('Change the nature of your active Pokémon')
    .addStringOption(o =>
      o.setName('nature')
       .setDescription('e.g. adamant, timid, jolly …')
       .setRequired(true)),

  async execute(inter) {
    const newNature = inter.options.getString('nature').toLowerCase();

    if (!isNature(newNature))
      return inter.reply('❌ Invalid nature. Try `/nature adamant`, etc.');

    /* find which Pokémon is active */
    const sel = db.prepare(
      'SELECT active_pokemon FROM users WHERE discord_id = ?'
    ).get(inter.user.id);
    if (!sel)
      return inter.reply('❌ You haven’t selected a Pokémon (`/select`).');

    const pRow = db.prepare(
      'SELECT * FROM pokemon WHERE instance_id = ?'
    ).get(sel.active_pokemon);

    /* update DB */
    db.prepare(
      'UPDATE pokemon SET nature = ? WHERE instance_id = ?'
    ).run(newNature, pRow.instance_id);

    /* recalc stats for confirmation embed */
    const base = getPokemon(pRow.dex_name);
    const ivs  = JSON.parse(pRow.ivs);
    const stats = calcStats(base.baseStats, pRow.level, ivs, newNature);

    const embed = new EmbedBuilder()
      .setTitle(`Nature changed to ${newNature.toUpperCase()}`)
      .setThumbnail(base.sprite)
      .addFields(
        ...Object.entries(stats).map(([k, v]) =>
          ({ name: k.toUpperCase(), value: String(v), inline: true }))
      )
      .setColor(0xfdbc4b);

    inter.reply({ embeds: [embed] });
  }
};
