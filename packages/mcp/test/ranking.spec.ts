import { loadCatalog } from '../src/catalog';
import { expand } from '../src/glossary';
import { search } from '../src/search';
import { CONSUMER } from './project';

/**
 * The questions people actually ask, and where the answer has to land.
 *
 * This file is the reason the scoring can be changed at all. Ranking has no unit — every rule is
 * only defensible against a set of real queries, and without one the next tweak is a coin flip.
 * Before partial matching five of these returned nothing whatsoever.
 */

const catalog = loadCatalog(CONSUMER);

/** `[query, what the answer must contain, how far down it may be]` */
const ACCEPTANCE: [string, string, number][] = [
    // Scenario 4, in the words it was asked in: "иконку для обычной ссылки и внешней ссылки,
    // тень для overlay или тень для другого элемента".
    ['обычная ссылка', 'link', 1],
    ['внешняя ссылка', 'link', 5],
    ['тень для оверлея', 'shadow-overlay', 1],

    // Russian questions about components.
    ['выбрать несколько значений', 'select', 1],
    ['вкладки', 'tabs', 1],
    ['хлебные крошки', 'breadcrumbs', 1],
    ['всплывающая подсказка', 'tooltip', 3],
    ['загрузка файлов', 'file-upload', 1],
    ['дерево с чекбоксами', 'tree', 1],
    ['выпадающий список', 'select', 3],

    // English must not have regressed to pay for it.
    ['select multiple', 'select', 1],
    ['virtual scroll', 'virtual-scroll', 1],
    ['kbq-alert', 'KbqAlert', 1],
    ['background error', 'error', 3]
];

for (const [query, expected, within] of ACCEPTANCE) {
    test(`"${query}" finds ${expected} in the top ${within}`, () => {
        const hits = search(catalog, query, { limit: 8 });
        const at = hits.findIndex((hit) => hit.ref.includes(expected) || hit.label.includes(expected));

        expect(
            at >= 0 && at < within,
            `${
                at < 0
                    ? `not found at all; got ${hits.map((hit) => hit.ref).join(', ') || '(nothing)'}`
                    : `found at #${at + 1}, wanted within ${within}; got ${hits
                          .slice(0, within + 2)
                          .map((hit) => hit.ref)
                          .join(', ')}`
            }`
        ).toBeTruthy();
    });
}

test('a complete match outranks a partial one', () => {
    // The whole risk of allowing partial matches: something that answers one word of the question
    // crowding out the thing that answers all of them.
    const hits = search(catalog, 'select multiple', { limit: 10 });
    const complete = hits.findIndex((hit) => hit.ref === 'select');
    const partial = hits.findIndex((hit) => hit.ref !== 'select' && !hit.ref.includes('multiple'));

    expect(complete >= 0, 'the complete match is missing').toBeTruthy();
    expect(partial === -1 || complete < partial, 'a partial match came first').toBeTruthy();
});

test('a query matching nothing still returns nothing', () => {
    // Partial matching must not turn every query into a hit list. One word of a phrase is a weak
    // answer; no word of it is not an answer at all.
    expect(search(catalog, 'zzzqqq wwwxxx')).toEqual([]);
});

test('junk far below the best hit is cut rather than padded to the limit', () => {
    const hits = search(catalog, 'kbq-alert', { limit: 50 });
    const best = hits[0]!.score;

    expect(
        hits.every((hit) => hit.score >= best * 0.2),
        'a hit below the floor survived'
    ).toBeTruthy();
    expect(hits.length < 50, 'the list was padded out to the limit with weak matches').toBeTruthy();
});

test('an inflected word matches its base form', () => {
    // «иконка корзины» against a tag of «корзина»: neither string contains the other.
    const hits = search(catalog, 'удалить', { kinds: ['icon'], limit: 20 });
    const inflected = search(catalog, 'удаления', { kinds: ['icon'], limit: 20 });

    expect(hits.length > 0).toBeTruthy();
    expect(inflected.length > 0, 'the inflected form found nothing').toBeTruthy();
});

test('endings may differ but stems may not', () => {
    // `список` and `списать` share four characters. Letting them match would make the stem rule
    // worse than no rule, because the wrong answer would look exactly as confident.
    const byStem = search(catalog, 'списать', { kinds: ['entry-point'], limit: 10 });

    expect(
        !byStem.some((hit) => hit.ref === 'list'),
        `"списать" matched the list component through "список": ${byStem.map((hit) => hit.ref).join(', ')}`
    ).toBeTruthy();
});

test('the glossary answers only where the data has no Russian', () => {
    expect(expand('тень')).toEqual(['тень', 'shadow']);
    expect(expand('оверлея'), 'an inflected form must reach the entry').toEqual(['оверлея', 'overlay']);
    expect(expand('alert'), 'an English word is left alone').toEqual(['alert']);
    expect(expand('абракадабра')).toEqual(['абракадабра']);
});

test('a literal match outranks one reached through the glossary', () => {
    // `shadow` found via «тень» is a guess about intent. Something that actually says «тень» is not,
    // and must come first whenever both exist.
    const hits = search(catalog, 'тень', { limit: 10 });
    const translated = hits.find((hit) => hit.ref.includes('shadow'));

    expect(translated, 'the translation did not work at all').toBeTruthy();

    const literal = hits.find((hit) => /тень/i.test(hit.detail) || /тень/i.test(hit.label));
    const literalNotBeaten = !literal || hits.indexOf(literal) < hits.indexOf(translated!);

    expect(literalNotBeaten, 'the guess outranked the literal match').toBeTruthy();
});

test('restricting to one kind does not change what wins inside it', () => {
    const all = search(catalog, 'тень для оверлея', { limit: 20 });
    const tokensOnly = search(catalog, 'тень для оверлея', { kinds: ['token'], limit: 20 });
    const firstTokenOverall = all.find((hit) => hit.kind === 'token');

    expect(firstTokenOverall).toBeTruthy();
    expect(tokensOnly[0]?.ref).toBe(firstTokenOverall!.ref);
});
