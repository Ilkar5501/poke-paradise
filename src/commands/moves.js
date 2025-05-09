// src/commands/moves.js
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
      .filter(move => moveData[move.toLowerCase()]) // Case-insensitive
      .map(move => {
        const md = moveData[move.toLowerCase()];
        return `**${move.toUpperCase()}** | 💥 **BP:** ${md.power} | 🎯 **${md.accuracy}%** | ${md.type} | **\`${md.category === 'physical' ? 'PHYS' : 'SPEC'}\`**`;
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
