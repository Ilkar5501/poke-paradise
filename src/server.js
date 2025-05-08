import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const app  = express();

app.get('/', (_, res) => res.send('OK'));  // health check for Render

app.listen(PORT, () =>
  console.log(`🌐 Express listening on ${PORT}`)
);

// --------- Discord bot ----------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
