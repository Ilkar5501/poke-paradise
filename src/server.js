// src/server.js
import express from 'express';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadCommands } from './loader.js';
import { registerSlash } from './register.js';
import 'dotenv/config';

/* ────────── tiny Express server for Render's health check ────────── */
const PORT = process.env.PORT || 3000;
express().get('/', (_, res) => res.send('OK')).listen(PORT, () =>
  console.log(`🌐 Express on ${PORT}`)
);

/* ────────── Discord client setup ────────── */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

/* once logged in: load files, register slash commands */
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Load every file in src/commands/
  const cmdArray = await loadCommands();
  cmdArray.forEach(c => client.commands.set(c.data.name, c));

  // Register globally (or change to applicationGuildCommands for faster test)
  await registerSlash(cmdArray);
});

/* route each slash interaction to its execute() function */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      interaction.editReply('❌ An error occurred.');
    } else {
      interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
