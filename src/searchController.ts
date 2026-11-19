import { debounce } from './debounce.js';
import { runCountrySearch, type SearchOutcome } from './runCountrySearch.js';

const DEFAULT_DEBOUNCE_DELAY_MS = 350;

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | Exclude<SearchOutcome, { status: 'aborted' }>;

export function createSearchController(
  onStateChange: (state: SearchState) => void,
  debounceDelay = DEFAULT_DEBOUNCE_DELAY_MS,
) {
  let latestQuery = '';
  let currentController: AbortController | undefined;

  function cancelCurrentSearch(): void {
    currentController?.abort();
    currentController = undefined;
  }

  async function search(query: string, controller: AbortController) {
    if (currentController !== controller) return;

    onStateChange({ status: 'loading' });
    const outcome = await runCountrySearch(query, controller.signal);

    if (currentController !== controller) return;

    currentController = undefined;
    if (outcome.status !== 'aborted') {
      onStateChange(outcome);
    }
  }

  const searchAfterPause = debounce(
    (query: string, controller: AbortController) => {
      void search(query, controller);
    },
    debounceDelay,
  );

  return {
    setQuery(query: string): void {
      cancelCurrentSearch();
      latestQuery = query.trim();

      if (latestQuery) {
        currentController = new AbortController();
        searchAfterPause(latestQuery, currentController);
      }

      onStateChange({ status: 'idle' });
    },
    retry(): void {
      if (!latestQuery) return;

      cancelCurrentSearch();
      currentController = new AbortController();
      void search(latestQuery, currentController);
    },
  };
}
