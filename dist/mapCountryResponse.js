export function mapCountryResponse(raw) {
    return {
        name: raw.name,
        flagUrl: raw.flags?.svg || raw.flags?.png || null,
        capital: raw.capital ?? null,
        region: raw.region ?? null,
        population: raw.population ?? null,
        languages: raw.languages?.map((language) => language.name) ?? [],
    };
}
