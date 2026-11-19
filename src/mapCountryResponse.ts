import type { CountryResponse } from './searchCountries.js';

export interface CountryCardData {
  name: string;
  flagUrl: string | null;
  capital: string | null;
  region: string | null;
  population: number | null;
  languages: string[];
}

export const mapCountryResponse: (
  raw: CountryResponse,
) => CountryCardData = () => ({
  name: '',
  flagUrl: null,
  capital: null,
  region: null,
  population: null,
  languages: [],
});
