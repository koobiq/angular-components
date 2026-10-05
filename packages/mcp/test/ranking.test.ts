import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCatalog } from '../src/catalog.ts';
import { expand } from '../src/glossary.ts';
import { search } from '../src/search.ts';
import { CONSUMER } from './project.ts';

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

        assert.ok(
            at >= 0 && at < within,
            at < 0
                ? `not found at all; got ${hits.map((hit) => hit.ref).join(', ') || '(nothing)'}`
                : `found at #${at + 1}, wanted within ${within}; got ${hits
                      .slice(0, within + 2)
                      .map((hit) => hit.ref)
                      .join(', ')}`
        );
    });
}

test('a complete match outranks a partial one', () => {
    // The whole risk of allowing partial matches: something that answers one word of the question
    // crowding out the thing that answers all of them.
    const hits = search(catalog, 'select multiple', { limit: 10 });
    const complete = hits.findIndex((hit) => hit.ref === 'select');
    const partial = hits.findIndex((hit) => hit.ref !== 'select' && !hit.ref.includes('multiple'));

    assert.ok(complete >= 0, 'the complete match is missing');
    assert.ok(partial === -1 || complete < partial, 'a partial match came first');
});

test('a query matching nothing still returns nothing', () => {
    // Partial matching must not turn every query into a hit list. One word of a phrase is a weak
    // answer; no word of it is not an answer at all.
    assert.deepEqual(search(catalog, 'zzzqqq wwwxxx'), []);
});

test('junk far below the best hit is cut rather than padded to the limit', () => {
    const hits = search(catalog, 'kbq-alert', { limit: 50 });
    const best = hits[0]!.score;

    assert.ok(
        hits.every((hit) => hit.score >= best * 0.2),
        'a hit below the floor survived'
    );
    assert.ok(hits.length < 50, 'the list was padded out to the limit with weak matches');
});

test('an inflected word matches its base form', () => {
    // «иконка корзины» against a tag of «корзина»: neither string contains the other.
    const hits = search(catalog, 'удалить', { kinds: ['icon'], limit: 20 });
    const inflected = search(catalog, 'удаления', { kinds: ['icon'], limit: 20 });

    assert.ok(hits.length > 0);
    assert.ok(inflected.length > 0, 'the inflected form found nothing');
});

test('endings may differ but stems may not', () => {
    // `список` and `списать` share four characters. Letting them match would make the stem rule
    // worse than no rule, because the wrong answer would look exactly as confident.
    const byStem = search(catalog, 'списать', { kinds: ['entry-point'], limit: 10 });

    assert.ok(
        !byStem.some((hit) => hit.ref === 'list'),
        `"списать" matched the list component through "список": ${byStem.map((hit) => hit.ref).join(', ')}`
    );
});

test('the glossary answers only where the data has no Russian', () => {
    assert.deepEqual(expand('тень'), ['тень', 'shadow']);
    assert.deepEqual(expand('оверлея'), ['оверлея', 'overlay'], 'an inflected form must reach the entry');
    assert.deepEqual(expand('alert'), ['alert'], 'an English word is left alone');
    assert.deepEqual(expand('абракадабра'), ['абракадабра']);
});

test('a literal match outranks one reached through the glossary', () => {
    // `shadow` found via «тень» is a guess about intent. Something that actually says «тень» is not,
    // and must come first whenever both exist.
    const hits = search(catalog, 'тень', { limit: 10 });
    const translated = hits.find((hit) => hit.ref.includes('shadow'));

    assert.ok(translated, 'the translation did not work at all');

    const literal = hits.find((hit) => /тень/i.test(hit.detail) || /тень/i.test(hit.label));

    if (literal) {
        assert.ok(hits.indexOf(literal) < hits.indexOf(translated), 'the guess outranked the literal match');
    }
});

test('restricting to one kind does not change what wins inside it', () => {
    const all = search(catalog, 'тень для оверлея', { limit: 20 });
    const tokensOnly = search(catalog, 'тень для оверлея', { kinds: ['token'], limit: 20 });
    const firstTokenOverall = all.find((hit) => hit.kind === 'token');

    assert.ok(firstTokenOverall);
    assert.equal(tokensOnly[0]?.ref, firstTokenOverall.ref);
});
