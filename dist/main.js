import { mapCountryResponse, } from './mapCountryResponse.js';
import { createSearchController, } from './searchController.js';
const formatNumber = new Intl.NumberFormat('ru-RU');
const noData = 'Нет данных';
const main = document.createElement('main');
const title = document.createElement('h1');
title.textContent = 'Поиск стран';
const label = document.createElement('label');
label.htmlFor = 'country-query';
label.textContent = 'Название страны (на английском)';
const input = document.createElement('input');
input.id = 'country-query';
input.type = 'search';
input.autocomplete = 'off';
const message = document.createElement('p');
message.setAttribute('role', 'status');
const progress = document.createElement('progress');
progress.setAttribute('aria-label', 'Загрузка результатов');
progress.hidden = true;
const retry = document.createElement('button');
retry.type = 'button';
retry.textContent = 'Повторить';
retry.hidden = true;
const results = document.createElement('ul');
results.id = 'results';
const details = document.createElement('dialog');
details.setAttribute('aria-labelledby', 'country-name');
const detailsTitle = document.createElement('h2');
detailsTitle.id = 'country-name';
const description = document.createElement('p');
const detailsList = document.createElement('dl');
const close = document.createElement('button');
close.type = 'button';
close.textContent = 'Закрыть';
close.addEventListener('click', () => details.close());
details.append(detailsTitle, description, detailsList, close);
function showDetails(raw, country) {
    detailsTitle.textContent = country.name;
    const location = raw.subregion || country.region;
    description.textContent =
        [
            location && `Регион: ${location}.`,
            country.capital && `Столица: ${country.capital}.`,
        ]
            .filter(Boolean)
            .join(' ') || 'Краткое описание недоступно.';
    const area = raw.area == null ? noData : `${formatNumber.format(raw.area)} км²`;
    const borders = raw.borders?.join(', ') || 'Не указаны';
    const currencies = raw.currencies
        ?.map((currency) => `${currency.name} (${currency.code})`)
        .join(', ') || noData;
    const fields = [
        ['Площадь', area],
        ['Соседние страны (коды)', borders],
        ['Языки', country.languages.join(', ') || noData],
        ['Валюты', currencies],
    ];
    detailsList.replaceChildren();
    for (const [label, value] of fields) {
        const term = document.createElement('dt');
        term.textContent = label;
        const definition = document.createElement('dd');
        definition.textContent = value;
        detailsList.append(term, definition);
    }
    details.showModal();
}
function createCard(raw) {
    const country = mapCountryResponse(raw);
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'country-card';
    button.setAttribute('aria-haspopup', 'dialog');
    if (country.flagUrl) {
        const flag = document.createElement('img');
        flag.src = country.flagUrl;
        flag.alt = '';
        flag.width = 32;
        flag.loading = 'lazy';
        button.append(flag);
    }
    const name = document.createElement('strong');
    name.textContent = country.name;
    const info = document.createElement('span');
    const population = country.population == null
        ? noData
        : formatNumber.format(country.population);
    info.textContent = `Столица: ${country.capital || noData} · Регион: ${country.region || noData} · Население: ${population}`;
    button.append(name, info);
    button.addEventListener('click', () => showDetails(raw, country));
    item.append(button);
    return item;
}
function render(state) {
    results.replaceChildren();
    progress.hidden = state.status !== 'loading';
    retry.hidden = state.status !== 'error';
    switch (state.status) {
        case 'idle':
            message.textContent = '';
            break;
        case 'loading':
            message.textContent = 'Ищем страны…';
            break;
        case 'empty':
            message.textContent = 'Ничего не найдено. Попробуйте другое название.';
            break;
        case 'error':
            message.textContent =
                state.reason === 'timeout'
                    ? 'Сервер не ответил вовремя.'
                    : 'Не удалось загрузить результаты.';
            break;
        case 'results':
            message.textContent = `Найдено: ${state.countries.length}`;
            results.append(...state.countries.map(createCard));
            break;
    }
}
const search = createSearchController(render);
input.addEventListener('input', () => search.setQuery(input.value));
retry.addEventListener('click', () => {
    input.focus();
    search.retry();
});
main.append(title, label, input, message, progress, retry, results, details);
document.body.append(main);
