// src/register.js
import { REST, Routes } from 'discord.js';
import 'dotenv/config';

/**
 * Registers slash commands globally (or per-guild for fast testing)
 */
export async function registerSlash(commands) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const clientId = process.env.CLIENT_ID;

  await rest.put(
    Routes.applicationCommands(clientId),
    { body: commands.map(cmd => cmd.data.toJSON()) }
  );

  console.log(`🚀 Registered ${commands.length} global slash commands`);
}
