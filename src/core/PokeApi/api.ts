import type { PokemonResponse, GeneralEndpointResponse } from './types';

export interface PokemonData {
  id: number;
  name: string;
  type: string;
  img: string;
}

const networkError = async (response: Response) =>
  new Error(
    `Network Response Error: ${response.status} ${await response.text()}`
  );
const POKEAPI = 'https://pokeapi.co/api/v2';

const maxId = (await (async () => {
  const url = `${POKEAPI}/pokemon-species`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw await networkError(response);
    const data = (await response.json()) as GeneralEndpointResponse;
    return data.count;
  } catch (error) {
    console.error(`MaxId Fetch Error: ${error}`);
    return;
  }
})()) as NonNullable<number>;
if (!maxId) throw new Error('Failed to fetch maxId');

const getRandomId = () => Math.floor(Math.random() * maxId) + 1;

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

async function getRandomPokemonData(quantity: number) {
  const pokemon = new Map();
  while (pokemon.size < quantity) {
    const data = await fetchPokemonById(String(getRandomId()));
    pokemon.set(data.id, data);
  }
  return Array.from<PokemonData>(pokemon.values());
}

export { getRandomPokemonData, fetchPokemonById, maxId };
