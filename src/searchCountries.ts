export interface CountryResponse {
  name: string;
}

export class HttpError extends Error {
  declare readonly status: number;
}

export const searchCountries: (
  query: string,
  signal: AbortSignal,
) => Promise<CountryResponse[]> = () => Promise.resolve([]);
