import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCountrySearch } from '../src/runCountrySearch.js';

describe('runCountrySearch', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('возвращает найденные страны при успешном ответе', async () => {
    const countries = [{ name: 'Spain', capital: 'Madrid' }];
    fetchMock.mockResolvedValueOnce(Response.json(countries));

    const outcome = await runCountrySearch(
      'Spain',
      new AbortController().signal,
    );

    expect(outcome).toEqual({ status: 'results', countries });
  });

  it('отличает отмену запроса от ошибки', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

    const outcome = await runCountrySearch(
      'Spain',
      new AbortController().signal,
    );

    expect(outcome).toEqual({ status: 'aborted' });
  });

  it('передаёт сигнал таймаута в fetch и возвращает запрос для повтора', async () => {
    const timeoutSignal = AbortSignal.abort(
      new DOMException('Timed out', 'TimeoutError'),
    );
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal);
    fetchMock.mockImplementationOnce(async (_url, options) => {
      options?.signal?.throwIfAborted();
      return Response.json([]);
    });

    const outcome = await runCountrySearch(
      'Spain',
      new AbortController().signal,
    );

    expect(outcome).toEqual({
      status: 'error',
      reason: 'timeout',
      retryQuery: 'Spain',
    });
  });

  it('сохраняет HTTP-статус и запрос для повтора при ошибке сервера', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));

    const outcome = await runCountrySearch(
      'Spain',
      new AbortController().signal,
    );

    expect(outcome).toEqual({
      status: 'error',
      reason: 'http',
      httpStatus: 503,
      retryQuery: 'Spain',
    });
  });

  it('возвращает ошибку сети и запрос для повтора', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network error'));

    const outcome = await runCountrySearch(
      'Spain',
      new AbortController().signal,
    );

    expect(outcome).toEqual({
      status: 'error',
      reason: 'network',
      retryQuery: 'Spain',
    });
  });

  it('возвращает состояние без совпадений при ответе 404', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));

    const outcome = await runCountrySearch(
      'zzzz',
      new AbortController().signal,
    );

    expect(outcome).toEqual({ status: 'empty' });
  });
});
