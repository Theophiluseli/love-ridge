/**
 * Ghana cities/towns used for listings (Fix 4) and their region (Fix 6.3).
 * Staff can also type a city that is not in this list; it is saved as typed and
 * appears automatically in the public filters once a published listing uses it.
 */

export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Eastern',
  'Central',
  'Western',
  'Western North',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
] as const;

export const CITY_REGION: Record<string, string> = {
  Accra: 'Greater Accra',
  Tema: 'Greater Accra',
  Afienya: 'Greater Accra',
  Dodowa: 'Greater Accra',
  Prampram: 'Greater Accra',
  Kasoa: 'Central',
  'Cape Coast': 'Central',
  Aburi: 'Eastern',
  Peduase: 'Eastern',
  Akropong: 'Eastern',
  Koforidua: 'Eastern',
  Kumasi: 'Ashanti',
  Takoradi: 'Western',
};

export const KNOWN_CITIES: string[] = Object.keys(CITY_REGION);

/** Trim, collapse spaces and title-case a typed city name ("cape  coast" -> "Cape Coast"). */
export function normalizeCityName(raw?: string | null): string {
  const cleaned = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const known = KNOWN_CITIES.find((c) => c.toLowerCase() === cleaned.toLowerCase());
  if (known) return known;
  return cleaned
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
    .slice(0, 60);
}

/** Region for a known city, otherwise undefined. */
export function regionForCity(city?: string | null): string | undefined {
  const normalized = normalizeCityName(city);
  return CITY_REGION[normalized];
}

/**
 * Resolve the region to store. A known city always wins (so Kumasi can never be saved as
 * "Greater Accra" again); for a new city the staff-selected region is kept.
 */
export function resolveRegion(city?: string | null, requestedRegion?: string | null): string {
  return regionForCity(city) || (requestedRegion && String(requestedRegion).trim()) || 'Greater Accra';
}
