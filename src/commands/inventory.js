import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Show all Pokémon you own (max 50)'),

  async execute(inter) {
    // Fetch all Pokémon the user owns
    const mons = db.prepare(`
      SELECT instance_id, dex_name 
      FROM pokemon 
      WHERE owner_id = ?
      LIMIT 50
    `).all(inter.user.id);

    if (!mons.length) {
      return inter.reply('📭 Your inventory is empty. Use `/add` to create a Pokémon!');
    }

    // Display format: ID | Name | Nickname (nickname feature can be added later)
    const displayList = mons.map(
      (mon, index) => `ID: \`${mon.instance_id}\` | Name: ${mon.dex_name}`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`${inter.user.username} — Inventory (${mons.length}/50)`)
      .setColor(0x80cafa)
      .setDescription(displayList);

    inter.reply({ embeds: [embed] });
  }
};

