/**
 * PokeApi Wrapper
 * @see https://pokeapi.co/
 *
 */
import type { PokemonResponse, APIResourceList } from './types';
/** Represents the minimal Pokémon data used in the app. */
export interface PokemonData {
  id: number;
  name: string;
  type: string;
  img: string;
}
/**
 * Helper to create a detailed network error
 * from a fetch Response.
 * @param response - The fetch Response object.
 * @returns An Error with status and response text.
 */
const networkError = async (response: Response) =>
  new Error(
    `Network Response Error: ${response.status} ${await response.text()}`
  );
const POKEAPI = 'https://pokeapi.co/api/v2';
/**
 * The maximum Pokémon ID available in the PokéAPI.
 * Fetched at module load time.
 */
const maxId = (await (async () => {
  const url = `${POKEAPI}/pokemon-species`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw await networkError(response);
    const data = (await response.json()) as APIResourceList;
    return data.count;
  } catch (error) {
    console.error(`MaxId Fetch Error: ${error}`);
    return;
  }
})()) as NonNullable<number>;
if (!maxId) throw new Error('Failed to fetch maxId');

/**
 * Returns a random Pokémon ID within the valid range.
 * @returns A random Pokémon ID.
 */
const getRandomId = () => Math.floor(Math.random() * maxId) + 1;

/**
 * Fetches Pokémon data by ID from the PokéAPI.
 * Retries if the Pokémon does not have a valid sprite.
 * @param id - The Pokémon ID as a string.
 * @param currAttempt - The current retry attempt (default 0).
 * @returns A Promise resolving to the PokémonData.
 * @throws If unable to fetch a valid Pokémon after several attempts.
 */
async function fetchPokemonById(
  id: string,
  currAttempt = 0
): Promise<PokemonData> {
  const url = `${POKEAPI}/pokemon/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw await networkError(response);
    const data = (await response.json()) as PokemonResponse;
    if (!data.sprites.front_default)
      return await fetchPokemonById(id, currAttempt + 1);
    if (currAttempt > 5)
      throw new Error(
        'Failed to fetch Pokemon data. Could not find a valid sprite.'
      );
    return {
      id: data.id - 1,
      name: data.name,
      type: data.types[0]!.type.name,
      img: data.sprites.front_default
    };
  } catch (error) {
    throw new Error(`Pokemon Fetch Error: ${error}`);
  }
}

/**
 * Fetches a specified number of unique random Pokémon.
 * Ensures no duplicate Pokémon are returned.
 * @param quantity - The number of Pokémon to fetch.
 * @returns A Promise resolving to an array of unique PokemonData.
 */
async function getRandomPokemonData(quantity: number) {
  const pokemon = new Map();
  while (pokemon.size < quantity) {
    const data = await fetchPokemonById(String(getRandomId()));
    pokemon.set(data.id, data);
  }
  return Array.from<PokemonData>(pokemon.values());
}

export { getRandomPokemonData, fetchPokemonById, maxId };
