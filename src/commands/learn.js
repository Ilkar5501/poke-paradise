import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';

export default {
  data: new SlashCommandBuilder()
    .setName('moves')
    .setDescription('Show all learnable damaging moves for your active Pokémon'),

  async execute(inter) {
    // Check if the user has a selected Pokémon
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

    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} — Learnable Moves`)
      .setDescription(base.moves.length ? base.moves.join(', ') : 'None')
      .setColor(0x4caf50)
      .setThumbnail(base.sprite);

    inter.reply({ embeds: [embed] });
  }
};
