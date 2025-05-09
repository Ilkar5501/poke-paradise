// src/commands/learn.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';
import { getPokemon } from '../utils/pokedex.js';
import { readFileSync } from 'fs';

// Load the complete move list (fast)
const moveData = JSON.parse(readFileSync('data/moves.json'));

export default {
  data: new SlashCommandBuilder()
    .setName('learn')
    .setDescription('Teach your active Pokémon a new move')
    .addStringOption(option => 
      option.setName('move')
        .setDescription('Move name to learn')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('slot')
        .setDescription('Move slot (1 - 4)')
        .setRequired(true)
        .addChoices(
          { name: 'Move 1', value: 1 },
          { name: 'Move 2', value: 2 },
          { name: 'Move 3', value: 3 },
          { name: 'Move 4', value: 4 }
        )),

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

    // Ensure the Pokémon can learn the move
    const moveName = inter.options.getString('move').toLowerCase();
    if (!base.moves.includes(moveName))
      return inter.reply(`❌ ${base.name} cannot learn **${moveName}**.`);

    // Ensure the move exists in moves.json
    if (!moveData[moveName])
      return inter.reply('❌ Move data not found (invalid move).');

    // Set the move in the specified slot
    const slot = inter.options.getInteger('slot');
    const moves = JSON.parse(row.moves || '[]');

    // Expand to 4 slots if not already (empty by default)
    while (moves.length < 4) moves.push(null);

    // Set the selected move
    moves[slot - 1] = moveName;

    // Update the database
    db.prepare(`
      UPDATE pokemon 
      SET moves = ? 
      WHERE instance_id = ?
    `).run(JSON.stringify(moves), row.instance_id);

    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} — Learned Move`)
      .setDescription(`✅ ${base.name} learned **${moveName}** in slot **${slot}**!`)
      .setThumbnail(base.sprite)
      .addFields(
        { name: 'Slot 1', value: moves[0] ? moves[0] : '—', inline: true },
        { name: 'Slot 2', value: moves[1] ? moves[1] : '—', inline: true },
        { name: 'Slot 3', value: moves[2] ? moves[2] : '—', inline: true },
        { name: 'Slot 4', value: moves[3] ? moves[3] : '—', inline: true }
      )
      .setColor(0x4caf50);

    inter.reply({ embeds: [embed] });
  }
};
