import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';

export default {
  data: new SlashCommandBuilder()
    .setName('learn')
    .setDescription('Teach your active Pokémon a new move')
    .addStringOption(o =>
      o.setName('move')
       .setDescription('Move name (must be a valid damaging move)')
       .setRequired(true)),

  async execute(inter) {
    const move = inter.options.getString('move').toLowerCase();

    /* find active Pokémon */
    const sel = db.prepare(`
      SELECT active_pokemon FROM users WHERE discord_id = ?
    `).get(inter.user.id);

    if (!sel)
      return inter.reply('❌ You haven’t selected a Pokémon (`/select`).');

    const row = db.prepare(`
      SELECT * FROM pokemon WHERE instance_id = ?
    `).get(sel.active_pokemon);

    const base = getPokemon(row.dex_name);
    if (!base.moves.includes(move))
      return inter.reply(`❌ **${move}** is not a valid damaging move for ${base.name}.`);

    /* update moves list (FIFO if full) */
    const moves = JSON.parse(row.moves);
    if (!Array.isArray(moves)) return inter.reply('❌ Error: Moves list corrupted.');

    if (moves.length >= 4) moves.shift();  // remove oldest
    moves.push(move);

    db.prepare(`
      UPDATE pokemon SET moves = ? WHERE instance_id = ?
    `).run(JSON.stringify(moves), row.instance_id);

    /* show updated list */
    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} — Updated Moves`)
      .setDescription(moves.length ? moves.join(', ') : 'None')
      .setColor(0x4caf50);

    inter.reply({ embeds: [embed] });
  }
};
