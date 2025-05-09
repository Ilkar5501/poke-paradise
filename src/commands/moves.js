// src/commands/moves.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { readFileSync } from 'fs';

// Load the complete move list (fast)
const moveData = JSON.parse(readFileSync('data/moves.json'));

/**
 * Formats a move with icons and clean text
 * @param {string} name - Move name
 * @param {object} md - Move data object (power, accuracy, type, category)
 * @returns {string} - Formatted move string
 */
function formatMove(name, md) {
  return `**${name.toUpperCase()}** | 💥 **BP:** ${md.power} | 🎯 **${md.accuracy}%** | ${md.type.toUpperCase()} | **\`${md.category === 'physical' ? 'PHYS' : 'SPEC'}\`**`;
}

/**
 * Filters the move list based on criteria
 * @param {object[]} moves - Array of move names
 * @param {string} sortBy - Sorting option
 * @param {string} typeFilter - Type filter (e.g., "electric")
 * @param {string} categoryFilter - Category filter ("PHYS", "SPEC")
 * @param {number} minPower - Minimum base power
 * @param {number} minAccuracy - Minimum accuracy
 * @returns {string[]} - Filtered and formatted move list
 */
function filterMoves(moves, sortBy, typeFilter, categoryFilter, minPower, minAccuracy) {
  return moves
    .filter(move => moveData[move.toLowerCase()])
    .map(move => ({
      name: move,
      ...moveData[move.toLowerCase()]
    }))
    .filter(move => 
      (!typeFilter || move.type.toLowerCase() === typeFilter.toLowerCase()) &&
      (!categoryFilter || (categoryFilter === 'PHYS' && move.category === 'physical') || 
                          (categoryFilter === 'SPEC' && move.category === 'special')) &&
      (!minPower || move.power >= minPower) &&
      (!minAccuracy || move.accuracy >= minAccuracy)
    )
    .sort((a, b) => {
      if (sortBy === 'power') return b.power - a.power;
      if (sortBy === 'accuracy') return b.accuracy - a.accuracy;
      return a.name.localeCompare(b.name);
    })
    .map(move => formatMove(move.name, move));
}

export default {
  data: new SlashCommandBuilder()
    .setName('moves')
    .setDescription('Show all learnable damaging moves for your active Pokémon')
    .addStringOption(option =>
      option.setName('sort')
        .setDescription('Sort moves by')
        .addChoices(
          { name: 'Alphabetical', value: 'name' },
          { name: 'Base Power', value: 'power' },
          { name: 'Accuracy', value: 'accuracy' }
        ))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Filter by move type (e.g., electric)'))
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Filter by move category (PHYS or SPEC)')
        .addChoices(
          { name: 'PHYS', value: 'PHYS' },
          { name: 'SPEC', value: 'SPEC' }
        ))
    .addIntegerOption(option =>
      option.setName('minpower')
        .setDescription('Minimum base power of moves'))
    .addIntegerOption(option =>
      option.setName('minaccuracy')
        .setDescription('Minimum accuracy of moves')),

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

    // Get filter options
    const sortBy = inter.options.getString('sort') || 'name';
    const typeFilter = inter.options.getString('type');
    const categoryFilter = inter.options.getString('category');
    const minPower = inter.options.getInteger('minpower');
    const minAccuracy = inter.options.getInteger('minaccuracy');

    // Filter and sort moves
    const filteredMoves = filterMoves(
      base.moves,
      sortBy,
      typeFilter,
      categoryFilter,
      minPower,
      minAccuracy
    );

    // Display moves in a scrollable embed (if > 25)
    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} — Learnable Moves`)
      .setColor(0x4caf50)
      .setThumbnail(base.sprite);

    if (filteredMoves.length === 0) {
      embed.setDescription('❌ No moves match your filter criteria.');
    } else {
      embed.setDescription(filteredMoves.slice(0, 25).join('\n'));

      if (filteredMoves.length > 25) {
        embed.addFields({
          name: 'Notice',
          value: `🔽 Scroll down for more moves (total: ${filteredMoves.length})`
        });
      }
    }

    inter.reply({ embeds: [embed] });
  }
};
