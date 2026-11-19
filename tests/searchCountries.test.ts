import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError, searchCountries } from '../src/searchCountries.js';

describe('searchCountries', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('успешный ответ возвращает массив стран', async () => {
    const countries = [{ name: 'New Zealand', capital: 'Wellington' }];
    fetchMock.mockResolvedValueOnce(Response.json(countries));

    const result = await searchCountries(
      'New Zealand',
      new AbortController().signal,
    );

    expect(result).toEqual(countries);
  });

  it('fetch передаёт сигнал в fetch', async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    const { signal } = new AbortController();

    await searchCountries('New Zealand', signal);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('https://countries.dev/name/New%20Zealand');
    expect(options?.signal).toBe(signal);
  });

  it('при 404 коде ответа возвращает пустой массив', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Country not found', { status: 404 }),
    );

    const result = await searchCountries(
      'unknown-country',
      new AbortController().signal,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
  });

  it('при ошибке сервера выбрасывает HttpError и ставит статус кода ответа 500', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 }),
    );

    const result = searchCountries('New Zealand', new AbortController().signal);

    await expect(result).rejects.toBeInstanceOf(HttpError);
    await expect(result).rejects.toHaveProperty('status', 500);
  });
});
