import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { readFileSync } from 'fs';

// Load the complete move list (fast)
const moveData = JSON.parse(readFileSync('data/moves.json'));

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

    if (!base.moves || base.moves.length === 0)
      return inter.reply('❌ This Pokémon has no damaging moves it can learn.');

    // Collect move details from moves.json
    const detailedMoves = base.moves
      .filter(move => moveData[move]) // Only include moves that exist in moves.json
      .map(move => {
        const md = moveData[move];
        return `${move} | ${md.power} Power | ${md.accuracy}% Accuracy | ${md.type} | ${md.category.charAt(0).toUpperCase() + md.category.slice(1)}`;
      })
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically

    // Split into multiple embeds if > 25 moves (Discord embed field limit)
    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} — Learnable Moves`)
      .setDescription(detailedMoves.join('\n'))
      .setColor(0x4caf50)
      .setThumbnail(base.sprite);

    inter.reply({ embeds: [embed] });
  }
};
