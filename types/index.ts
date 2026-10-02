export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
      dream_world: {
        front_default: string | null;
      };
    };
  };
  moves: Array<{
    move: {
      name: string;
    };
  }>;
  description: string;
}

export interface Game {
  id: number;
  title: string;
  name: string;
  thumbnail: string;
  screenshots: Array<{ image: string }>;
  release_date: string;
  developer: string;
  description: string;
  short_description: string;
  images: string[];
  released: string;
}

export interface ApiError extends Error {
  message: 'EMPTY_QUERY' | 'POKEMON_NOT_FOUND' | 'GAME_NOT_FOUND';
}