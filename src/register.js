// src/register.js
import { REST, Routes } from 'discord.js';
import 'dotenv/config';

/**
 * Registers slash commands globally (recommended for multi-server bots)
 */
export async function registerSlash(commands) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const clientId = process.env.CLIENT_ID;

  try {
    // Global registration (for all servers)
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands.map(cmd => cmd.data.toJSON()) }
    );

    console.log(`🚀 Registered ${commands.length} global slash commands`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}
