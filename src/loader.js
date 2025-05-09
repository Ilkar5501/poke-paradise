// src/loader.js
import { readdirSync } from 'fs';
import { join } from 'path';

/**
 * Reads every .js file in ./commands and returns an array
 * of { data: SlashCommandBuilder, execute(interaction) }.
 */
export async function loadCommands() {
  const commandsDir = join(process.cwd(), 'src', 'commands');
  const commands = [];

  for (const file of readdirSync(commandsDir)) {
    if (!file.endsWith('.js')) continue;
    const { default: cmd } = await import(`./commands/${file}`);
    if (cmd?.data && cmd?.execute) {
      commands.push(cmd);
    } else {
      console.warn(`⚠️  Skipped invalid command: ${file}`);
    }
  }

  console.log(`✅ Loaded ${commands.length} commands from /commands.`);
  return commands;
}
