import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from '../src/mapCountryResponse.js';
import countries from './fixtures/countries.json' with { type: 'json' };

describe('mapCountryResponse', () => {
  it('конвертирует ответ API в данные для карточки страны', () => {
    const raw = Object.freeze(countries.newZealand);

    expect(mapCountryResponse(raw)).toEqual({
      name: 'New Zealand',
      flagUrl: 'https://flagcdn.com/nz.svg',
      capital: 'Wellington',
      region: 'Oceania',
      population: 5084300,
      languages: ['English', 'Māori'],
    });
  });

  it('использует PNG флага, если SVG отсутствует', () => {
    const raw = {
      ...countries.newZealand,
      flags: { png: countries.newZealand.flags.png },
    };

    expect(mapCountryResponse(raw).flagUrl).toBe(
      'https://flagcdn.com/w320/nz.png',
    );
  });

  it('заполняет пропущенные поля и сохраняет нулевое население', () => {
    expect(mapCountryResponse(countries.withoutOptionalFields)).toEqual({
      name: 'Example Territory',
      flagUrl: null,
      capital: null,
      region: null,
      population: 0,
      languages: [],
    });
  });
});
