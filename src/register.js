// src/register.js
import { REST, Routes } from 'discord.js';
import 'dotenv/config';

/**
 * Registers slash commands globally (or per-guild for fast testing)
 */
export async function registerSlash(commands) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID; // optional: for fast testing

  try {
    // Use global registration (recommended for production)
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands.map(cmd => cmd.data.toJSON()) }
    );

    console.log(`🚀 Registered ${commands.length} global slash commands`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}
