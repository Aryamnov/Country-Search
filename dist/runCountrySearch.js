import { HttpError, searchCountries, } from './searchCountries.js';
const REQUEST_TIMEOUT_MS = 10_000;
export async function runCountrySearch(query, signal) {
    const requestSignal = AbortSignal.any([
        signal,
        AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    ]);
    try {
        const countries = await searchCountries(query, requestSignal);
        requestSignal.throwIfAborted();
        return countries.length === 0
            ? { status: 'empty' }
            : { status: 'results', countries };
    }
    catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return { status: 'aborted' };
        }
        if (error instanceof DOMException && error.name === 'TimeoutError') {
            return { status: 'error', reason: 'timeout', retryQuery: query };
        }
        if (error instanceof HttpError) {
            return {
                status: 'error',
                reason: 'http',
                httpStatus: error.status,
                retryQuery: query,
            };
        }
        return { status: 'error', reason: 'network', retryQuery: query };
    }
}
