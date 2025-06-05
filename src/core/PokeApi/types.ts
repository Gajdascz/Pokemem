export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface Ability {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource | null;
}

export interface Form {
  name: string;
  url: string;
}

export interface GameIndex {
  game_index: number;
  version: NamedAPIResource;
}

export interface HeldItemVersionDetail {
  rarity: number;
  version: NamedAPIResource;
}

export interface HeldItem {
  item: NamedAPIResource;
  version_details: HeldItemVersionDetail[];
}

export interface MoveVersionGroupDetail {
  level_learned_at: number;
  version_group: NamedAPIResource;
  move_learn_method: NamedAPIResource;
  order?: number;
}

export interface Move {
  move: NamedAPIResource;
  version_group_details: MoveVersionGroupDetail[];
}
type StringOrNull = string | null;
export interface Sprites {
  back_default: StringOrNull;
  back_female: StringOrNull;
  back_shiny: StringOrNull;
  back_shiny_female: StringOrNull;
  front_default: StringOrNull;
  front_female: StringOrNull;
  front_shiny: StringOrNull;
  front_shiny_female: StringOrNull;
  other?: {
    dream_world?: { front_default: StringOrNull; front_female: StringOrNull };
    home?: {
      front_default: StringOrNull;
      front_female: StringOrNull;
      front_shiny: StringOrNull;
      front_shiny_female: StringOrNull;
    };
    'official-artwork'?: {
      front_default: StringOrNull;
      front_shiny: StringOrNull;
    };
    showdown?: {
      back_default: StringOrNull;
      back_female: StringOrNull;
      back_shiny: StringOrNull;
      back_shiny_female: StringOrNull;
      front_default: StringOrNull;
      front_female: StringOrNull;
      front_shiny: StringOrNull;
      front_shiny_female: StringOrNull;
    };
  };
  versions?: Record<string, Record<string, Sprites>>;
}

export interface Cries {
  latest: string;
  legacy: string;
}

export interface Stat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface TypeSlot {
  slot: number;
  type: NamedAPIResource;
}

export interface PastType {
  generation: NamedAPIResource;
  types: TypeSlot[];
}

export interface PastAbility {
  generation: NamedAPIResource;
  abilities: Ability[];
}

export interface PokemonResponse {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
  forms: Form[];
  game_indices: GameIndex[];
  held_items: HeldItem[];
  location_area_encounters: string;
  moves: Move[];
  species: NamedAPIResource;
  sprites: Sprites;
  cries: Cries;
  stats: Stat[];
  types: TypeSlot[];
  past_types: PastType[];
  past_abilities: PastAbility[];
}

export interface SpeciesResponse {
  id: number;
  name: string;
  type: string;
  img: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: NamedAPIResource;
  pokedex_numbers: { entry_number: number; pokedex: NamedAPIResource }[];
  egg_groups: NamedAPIResource[];
  color: NamedAPIResource;
  shape: NamedAPIResource;
  evolves_from_species: NamedAPIResource;
  evolution_chain: NamedAPIResource;
  generation: NamedAPIResource;
  names: { name: string; language: NamedAPIResource }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedAPIResource;
    version: NamedAPIResource;
  }[];
  form_descriptions: { description: string; language: NamedAPIResource }[];
  genera: { genus: string; language: NamedAPIResource }[];
  varieties: { is_default: boolean; pokemon: NamedAPIResource }[];
}

export interface GeneralEndpointResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}
