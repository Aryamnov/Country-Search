import type { SearchOutcome } from './runCountrySearch.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | Exclude<SearchOutcome, { status: 'aborted' }>;

export const createSearchController: (
  onStateChange: (state: SearchState) => void,
  debounceDelay: number,
) => { setQuery(query: string): void } = () => ({
  setQuery: () => undefined,
});
