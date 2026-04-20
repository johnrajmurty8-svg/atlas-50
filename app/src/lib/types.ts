export type ThemeTag = 'beaches' | 'mountains' | 'culture' | 'food' | 'desert' | 'wildlife' | 'adventure';
export type VibeTag = 'romantic' | 'adventurous' | 'cultural' | 'social' | 'spiritual' | 'offbeat' | 'luxurious' | 'budget-friendly';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type EnvironmentTag = 'mountains' | 'coast' | 'desert' | 'jungle' | 'city' | 'islands' | 'plains' | 'tundra';
export type GroupSizeTag = 'solo' | 'couple' | 'friends' | 'family';
export type Region = 'Europe' | 'Asia' | 'Africa' | 'Americas' | 'Oceania';

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: Region;
  lat: number;
  lon: number;
  tagline: string;
  blurb: string;
  weather: string;
  dish: string;
  playlist: string;
  experiences: [string, string, string, string, string];
  images: string[];
  themes: ThemeTag[];
  vibe_tags: VibeTag[];
  cost_band: 1 | 2 | 3 | 4 | 5;
  best_season: Season[];
  environment_tags: EnvironmentTag[];
  group_size_tags: GroupSizeTag[];
}

export interface SmartPickerState {
  vibe: VibeTag | '';
  cost: string;
  season: Season | '';
  environment: EnvironmentTag | '';
  theme: ThemeTag | '';
  groupSize: GroupSizeTag | '';
}

export interface GlobeRef {
  flyTo: (destination: Destination) => void;
  resume: () => void;
}
