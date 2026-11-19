import { debounce } from './debounce.js';
import { runCountrySearch } from './runCountrySearch.js';
const DEFAULT_DEBOUNCE_DELAY_MS = 350;
export function createSearchController(onStateChange, debounceDelay = DEFAULT_DEBOUNCE_DELAY_MS) {
    let latestQuery = '';
    let currentController;
    function cancelCurrentSearch() {
        currentController?.abort();
        currentController = undefined;
    }
    async function search(query, controller) {
        if (currentController !== controller)
            return;
        onStateChange({ status: 'loading' });
        const outcome = await runCountrySearch(query, controller.signal);
        if (currentController !== controller)
            return;
        currentController = undefined;
        if (outcome.status !== 'aborted') {
            onStateChange(outcome);
        }
    }
    const searchAfterPause = debounce((query, controller) => {
        void search(query, controller);
    }, debounceDelay);
    return {
        setQuery(query) {
            cancelCurrentSearch();
            latestQuery = query.trim();
            if (latestQuery) {
                currentController = new AbortController();
                searchAfterPause(latestQuery, currentController);
            }
            onStateChange({ status: 'idle' });
        },
        retry() {
            if (!latestQuery)
                return;
            cancelCurrentSearch();
            currentController = new AbortController();
            void search(latestQuery, currentController);
        },
    };
}
