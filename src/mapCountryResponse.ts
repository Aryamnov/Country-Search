import type { CountryResponse } from './searchCountries.js';

export interface CountryCardData {
  name: string;
  flagUrl: string | null;
  capital: string | null;
  region: string | null;
  population: number | null;
  languages: string[];
}

export function mapCountryResponse(raw: CountryResponse): CountryCardData {
  return {
    name: raw.name,
    flagUrl: raw.flags?.svg || raw.flags?.png || null,
    capital: raw.capital ?? null,
    region: raw.region ?? null,
    population: raw.population ?? null,
    languages: raw.languages?.map((language) => language.name) ?? [],
  };
}
