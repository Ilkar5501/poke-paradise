// src/utils/pokedex.js
import { readFileSync } from 'fs';

// Load all Pokémon data from pokedex.json
const data = JSON.parse(readFileSync('data/pokedex.json'));

/* Quick lookup maps (by name and by Dex ID) */
export const byName = data;
export const byId = Object.fromEntries(
  Object.values(data).map(p => [String(p.id), p])
);

/**
 * Fetches a Pokémon entry by name, using intuitive matching
 * @param {string} query - The Pokémon name or dex number (user input)
 * @returns {object|null} - The matched Pokémon object
 */
export function getPokemon(query) {
  // Normalize the query (remove special characters, lowercase)
  const normalizedQuery = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // Remove non-letter/non-digit characters
    .replace(/\s+/g, ' ')         // Replace multiple spaces with one
    .trim();

  // Direct lookup by name or ID
  if (byName[normalizedQuery]) return byName[normalizedQuery];
  if (byId[normalizedQuery]) return byId[normalizedQuery];

  // Attempt to match by intuitive name (forms)
  const formNames = Object.keys(byName).filter(name => {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ') // Convert to the same normalized format
      .trim();
    return cleanName === normalizedQuery;
  });

  if (formNames.length > 0) return byName[formNames[0]];

  // If no match is found
  return null;
}
