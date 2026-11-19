export interface CountryResponse {
  name: string;
  flags?: { svg?: string; png?: string } | null;
  capital?: string | null;
  region?: string | null;
  population?: number | null;
  languages?: ReadonlyArray<{ name: string }> | null;
  subregion?: string | null;
  area?: number | null;
  borders?: readonly string[] | null;
  currencies?: ReadonlyArray<{ code: string; name: string }> | null;
}

export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

export async function searchCountries(
  query: string,
  signal: AbortSignal,
): Promise<CountryResponse[]> {
  const url = `https://countries.dev/name/${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return (await response.json()) as CountryResponse[];
}
