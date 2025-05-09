// src/commands/stats.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPokemon } from '../utils/pokedex.js';
import { calcStats } from '../utils/calc.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show raw and calculated stats for a Pokémon')
    .addStringOption(o =>
      o.setName('query')
       .setDescription('Pokémon name or Dex #')
       .setRequired(true)
    ),

  async execute(inter) {
    const q    = inter.options.getString('query').toLowerCase();
    const base = getPokemon(q);
    if (!base) return inter.reply('❌ Pokémon not found.');

    // --- dummy initialization of raw stats ---
    let hpRaw   = 0,
        atkRaw  = 0,
        defRaw  = 0,
        spaRaw  = 0,
        spdRaw  = 0,
        speRaw  = 0;

    // assign from pokedex.json
    hpRaw  = base.baseStats.hp;
    atkRaw = base.baseStats.attack;
    defRaw = base.baseStats.defense;
    spaRaw = base.baseStats.sp_attack;
    spdRaw = base.baseStats.sp_defense;
    speRaw = base.baseStats.speed;

    // --- defaults for calculation ---
    const LEVEL  = 100;
    const IVS    = { hp:31, atk:31, def:31, spa:31, spd:31, spe:31 };
    const NATURE = 'hardy';

    // perform the calc
    const stats = calcStats(base.baseStats, LEVEL, IVS, NATURE);

    // build the debug embed
    const embed = new EmbedBuilder()
      .setTitle(`${base.name.toUpperCase()} — Raw vs. Calculated`)
      .addFields(
        // raw values
        { name: 'Raw HP',  value: String(hpRaw),  inline: true },
        { name: 'Raw ATK', value: String(atkRaw), inline: true },
        { name: 'Raw DEF', value: String(defRaw), inline: true },
        { name: 'Raw SPA', value: String(spaRaw), inline: true },
        { name: 'Raw SPD', value: String(spdRaw), inline: true },
        { name: 'Raw SPE', value: String(speRaw), inline: true },
        // calculated values
        { name: 'Calc HP',  value: String(stats.hp),  inline: true },
        { name: 'Calc ATK', value: String(stats.atk), inline: true },
        { name: 'Calc DEF', value: String(stats.def), inline: true },
        { name: 'Calc SPA', value: String(stats.spa), inline: true },
        { name: 'Calc SPD', value: String(stats.spd), inline: true },
        { name: 'Calc SPE', value: String(stats.spe), inline: true }
      )
      .setColor(0x4caf50);

    await inter.reply({ embeds: [embed] });
  }
};
