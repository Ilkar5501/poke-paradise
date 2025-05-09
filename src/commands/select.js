import { SlashCommandBuilder } from 'discord.js';
import db from '../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('select')
    .setDescription('Choose which Pokémon you will battle with')
    .addStringOption(o =>
      o.setName('id').setDescription('Instance ID from /inventory').setRequired(true)),

  async execute(inter) {
    const id = inter.options.getString('id');

    // Verify that the Pokémon belongs to the user
    const owned = db.prepare(`
      SELECT 1 FROM pokemon WHERE instance_id = ? AND owner_id = ?
    `).get(id, inter.user.id);

    if (!owned)
      return inter.reply('❌ You do not own a Pokémon with that ID.');

    // Set this Pokémon as the active Pokémon
    db.prepare(`
      INSERT INTO users (discord_id, active_pokemon)
      VALUES (?, ?)
      ON CONFLICT(discord_id) DO UPDATE SET active_pokemon = excluded.active_pokemon
    `).run(inter.user.id, id);

    inter.reply(`✅ Pokémon \`${id}\` is now your active Pokémon.`);
  }
};
