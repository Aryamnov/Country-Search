import { afterEach, expect, it, vi } from 'vitest';
import {
  createSearchController,
  type SearchState,
} from '../src/searchController.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('при новом запросе отменяется старый запрос и оставляет результат последнего запроса', async () => {
  vi.useFakeTimers();
  const debounceDelay = 100;
  const latestCountries = [{ name: 'Canada' }];
  const serverResponses: string[] = [];
  const onAbort = vi.fn<(query: string, reason: unknown) => void>();
  const fetchMock = vi.fn<typeof fetch>((url, options) => {
    const query = new URL(String(url)).pathname.slice('/name/'.length);
    const isFirst = query === 'ca';
    const countries = isFirst ? [{ name: 'Cambodia' }] : latestCountries;
    const responseDelay = isFirst ? 300 : 25;
    const signal = options?.signal;

    return new Promise<Response>((resolve, reject) => {
      signal?.throwIfAborted();

      const rejectOnAbort = () => {
        onAbort(query, signal?.reason);
        reject(signal?.reason);
      };

      signal?.addEventListener('abort', rejectOnAbort, { once: true });

      setTimeout(() => {
        signal?.removeEventListener('abort', rejectOnAbort);
        serverResponses.push(query);
        resolve(Response.json(countries));
      }, responseDelay);
    });
  });
  vi.stubGlobal('fetch', fetchMock);

  const onStateChange = vi.fn<(state: SearchState) => void>();
  const search = createSearchController(onStateChange, debounceDelay);

  search.setQuery('ca');
  await vi.advanceTimersByTimeAsync(debounceDelay);
  expect(fetchMock).toHaveBeenCalledTimes(1);

  search.setQuery('canada');
  expect(onAbort).toHaveBeenCalledWith(
    'ca',
    expect.objectContaining({ name: 'AbortError' }),
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);

  await vi.runAllTimersAsync();

  expect(serverResponses).toEqual(['canada', 'ca']);
  const latestResult = {
    status: 'results',
    countries: latestCountries,
  };
  const resultsAndErrors = onStateChange.mock.calls
    .map(([state]) => state)
    .filter(({ status }) => status === 'results' || status === 'error');

  expect(resultsAndErrors).toEqual([latestResult]);
  expect(onStateChange).toHaveBeenLastCalledWith(latestResult);
});
