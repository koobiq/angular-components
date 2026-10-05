import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCatalog } from '../src/catalog.ts';
import { compoundParts } from '../src/glossary.ts';
import { rarity } from '../src/matching.ts';
import { search } from '../src/search.ts';
import { pickGuide } from '../src/sources/guides.ts';
import { parseChoices, parseComponentNotes, parseKeywords } from '../src/sources/which-component.ts';
import { toolWhichComponent } from '../src/tools.ts';
import { CONSUMER } from './project.ts';

/**
 * Choosing a component by the job it does.
 *
 * The failure being measured is not "found nothing" — it is "found the neighbour". An agent asked
 * for a multi-select reaches for `autocomplete`, and nothing about the answer looks wrong. So every
 * case below asserts the component that must come *first*, not merely that something was returned.
 */

const catalog = loadCatalog(CONSUMER);
const guide = pickGuide(catalog.guides(), 'which-component-when', 'en');

/** `[task, the component that must be recommended first]` */
const ACCEPTANCE: [string, string][] = [
    ['multi-select from 500 options', 'select'],
    ['several values from a hierarchy', 'tree-select'],
    ['a message the user must acknowledge', 'modal'],
    ['switch between sections of content', 'tabs'],
    ['pick a date range', 'datepicker'],
    ['text that does not fit the width', 'title'],
    ['edit a value in place', 'inline-edit'],
    ['show that something is loading', 'progress'],
    ['a menu of actions', 'dropdown'],
    ['a setting that applies immediately', 'toggle'],
    ['select rows of page content', 'list']
];

const recommendations = (task: string): string[] =>
    toolWhichComponent(catalog, { task })
        .split('\n')
        .filter((line) => line.startsWith('  use'))
        .map((line) => line.replace('  use  ', ''));

for (const [task, expected] of ACCEPTANCE) {
    test(`"${task}" recommends ${expected} first`, () => {
        const got = recommendations(task);

        assert.ok(got.length > 0, 'nothing was recommended');
        assert.ok(
            got[0]!.includes(expected),
            `got "${got[0]}" first; wanted ${expected}. Full list: ${got.join(' | ')}`
        );
    });
}

test('the guide is loaded from the components repository, like every other guide', () => {
    // The point of storing it there: one copy of the mapping, in the repository that owns the
    // components it describes. Nothing in the guide pipeline knows this document is special.
    assert.ok(guide, 'which-component-when is not bundled');
    assert.equal(guide.lang, 'en');
    assert.ok(guide.sections.length > 15, `only ${guide.sections.length} sections parsed`);
});

test('the tables are read as rows, not as prose', () => {
    const choices = parseChoices(guide);

    assert.ok(choices.length > 50, `only ${choices.length} rows`);

    const multi = choices.find((choice) => choice.task === 'Several values from a closed list');

    assert.ok(multi, 'a known row went missing');
    assert.equal(multi.use, 'select + multiple');
    assert.equal(multi.instead, 'autocomplete');
    assert.match(multi.why ?? '', /no `multiple` input/);
    assert.equal(multi.cluster, 'Pick a value from a set');
});

test('the keyword and component indexes are read too', () => {
    const keywords = parseKeywords(guide);
    const notes = parseComponentNotes(guide);

    // The keyword index sits directly under its own `##` heading with no subsections; slicing past
    // the heading dropped every entry.
    assert.ok(keywords.length > 5, `only ${keywords.length} keyword routes`);
    assert.ok(notes.length > 50, `only ${notes.length} component notes`);
    assert.ok(keywords.some((route) => route.words.some((word) => word.includes('500'))));
});

test('the answer names what not to use, and why not', () => {
    // Naming only the right component leaves the wrong one exactly as plausible as it was.
    const output = toolWhichComponent(catalog, { task: 'several values from a closed list' });

    assert.match(output, /use\s+select \+ multiple/);
    assert.match(output, /not\s+autocomplete/);
    assert.match(output, /why\s+.*multiple/);
    assert.match(output, /get_guide which-component-when/);
});

test('the column naming the wrong component is not scored', () => {
    // It names what must *not* be used, so matching on it ranks a row by the word it warns
    // against: before this, asking for a multi-select put `radio` first because `select` appears
    // in that row as the mistake.
    const got = recommendations('multi-select from 500 options');

    assert.ok(!got[0]!.startsWith('radio'), `"radio" came first: ${got.join(' | ')}`);
});

test('a task with nothing to match lists the clusters instead of inventing a component', () => {
    const output = toolWhichComponent(catalog, { task: 'zzzqqq wwwxxx' });

    assert.match(output, /Nothing in the component-choice guide matches/);
    assert.match(output, /Pick a value from a set/);
});

test('the answer stays small enough to call before every component decision', () => {
    for (const [task] of ACCEPTANCE) {
        const output = toolWhichComponent(catalog, { task });

        assert.ok(output.length < 1600, `"${task}" returned ${output.length} chars`);
    }
});

test('a compound word is split for prose but never for an identifier', () => {
    // In a sentence `multi-select` has to reach `select`. In an identifier the hyphen belongs to
    // the name: splitting `kbq-alert` yields `kbq`, the prefix of all 1420 symbols in the library.
    assert.deepEqual(compoundParts('multi-select'), ['multi', 'select']);
    assert.deepEqual(compoundParts('kbq-alert'), ['alert'], 'kbq is too short to be a part');

    const hits = search(catalog, 'kbq-alert', { limit: 5 });

    assert.ok(
        hits.some((hit) => hit.label.includes('KbqAlert')),
        `the selector search broke: ${hits.map((hit) => hit.label).join(', ')}`
    );
});

test('a rare word outweighs one the guide repeats everywhere', () => {
    const documents = ['free-form values no dictionary', 'the user types a value', 'the user picks a value'];
    const weights = rarity(['free-form', 'user'], documents);

    assert.ok(weights.get('free-form')! > weights.get('user')!);
    assert.ok(weights.get('user')! >= 1, 'a common word still has to count for something');
});

/**
 * `[task, expected, how far down it may be]`
 *
 * Russian is allowed a longer leash on two of these, and the reason is in the guide rather than in
 * the ranking: «показать что идёт загрузка» matches the empty-state row as fairly as the progress
 * one, because both Russian phrasings open with «показать».
 */
const ACCEPTANCE_RU: [string, string, number][] = [
    ['выбрать несколько значений из длинного списка', 'select', 1],
    ['несколько значений из иерархии', 'tree-select', 1],
    ['переключение между разделами содержимого', 'tabs', 1],
    ['выбрать диапазон дат', 'datepicker', 1],
    ['меню действий', 'dropdown', 1],
    ['настройка применяется сразу', 'toggle', 1],
    ['сообщение, которое пользователь должен подтвердить', 'modal', 2],
    ['текст не помещается по ширине', 'title', 2],
    ['показать что идёт загрузка', 'progress', 3]
];

for (const [task, expected, within] of ACCEPTANCE_RU) {
    test(`"${task}" — ${expected} в первых ${within}`, () => {
        const got = recommendations(task);
        const at = got.findIndex((line) => line.includes(expected));

        assert.ok(
            at >= 0 && at < within,
            at < 0 ? `не найден вовсе: ${got.join(' | ')}` : `на #${at + 1}: ${got.slice(0, within + 1).join(' | ')}`
        );
    });
}

test('both languages of the guide parse to the same structure', () => {
    // The parts are found by what they contain, not by their headings: `## Разграничение` is not
    // `## Disambiguation`, and matching titles failed silently on every Russian question.
    const ru = pickGuide(catalog.guides(), 'which-component-when', 'ru');

    assert.ok(ru, 'the Russian text is not bundled');
    assert.equal(parseChoices(ru).length, parseChoices(guide).length);
    assert.equal(parseKeywords(ru).length, parseKeywords(guide).length);
    assert.equal(parseComponentNotes(ru).length, parseComponentNotes(guide).length);
});

test('the keyword index is not confused with the component index', () => {
    // Both use `→`. The component index uses it in every second line, so a shape test that only
    // looks for an arrow picks the wrong part — and the keyword routing then runs on component
    // descriptions instead of on the words people type.
    const routes = parseKeywords(guide);

    assert.ok(
        routes.every((route) => route.words.every((word) => word.length < 40)),
        'component prose leaked in'
    );
    assert.ok(routes.some((route) => route.words.includes('multiselect')));
});

test('a Russian task is answered from the Russian text', () => {
    const output = toolWhichComponent(catalog, { task: 'выбрать несколько значений из списка' });

    assert.match(output, /\p{Script=Cyrillic}/u, 'the answer came back in English');
    assert.ok(!output.startsWith('The component-choice guide is not bundled'));
});
