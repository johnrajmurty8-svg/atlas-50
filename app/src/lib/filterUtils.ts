import type { Destination, SmartPickerState } from './types';

export function filterDestinations(
  destinations: Destination[],
  activeTheme: string,
  search: string,
  picker: SmartPickerState
): Destination[] {
  const q = search.trim().toLowerCase();
  return destinations.filter(dest => {
    if (activeTheme !== 'all' && !dest.themes.includes(activeTheme as never)) return false;
    if (q && !dest.name.toLowerCase().includes(q) && !dest.region.toLowerCase().includes(q)) return false;
    if (picker.vibe && !dest.vibe_tags.includes(picker.vibe as never)) return false;
    if (picker.cost && dest.cost_band !== Number(picker.cost)) return false;
    if (picker.season && !dest.best_season.includes(picker.season as never)) return false;
    if (picker.environment && !dest.environment_tags.includes(picker.environment as never)) return false;
    if (picker.theme && !dest.themes.includes(picker.theme as never)) return false;
    if (picker.groupSize && !dest.group_size_tags.includes(picker.groupSize as never)) return false;
    return true;
  });
}
