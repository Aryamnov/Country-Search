import type { CountryResponse } from './searchCountries.js';

export type SearchOutcome =
  | { status: 'results'; countries: CountryResponse[] }
  | { status: 'empty' }
  | { status: 'aborted' }
  | { status: 'error'; reason: 'timeout' | 'network'; retryQuery: string }
  | { status: 'error'; reason: 'http'; httpStatus: number; retryQuery: string };

export const runCountrySearch: (
  query: string,
  signal: AbortSignal,
) => Promise<SearchOutcome> = () =>
  Promise.resolve({ status: 'results', countries: [] });
