import { loadCatalog } from '../src/catalog';
import { compoundParts } from '../src/glossary';
import { rarity } from '../src/matching';
import { search } from '../src/search';
import { pickGuide } from '../src/sources/guides';
import { parseChoices, parseComponentNotes, parseKeywords } from '../src/sources/which-component';
import { toolWhichComponent } from '../src/tools';
import { CONSUMER } from './project';

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

        expect(got.length > 0, 'nothing was recommended').toBeTruthy();
        expect(
            got[0]!.includes(expected),
            `got "${got[0]}" first; wanted ${expected}. Full list: ${got.join(' | ')}`
        ).toBeTruthy();
    });
}

test('the guide is loaded from the components repository, like every other guide', () => {
    // The point of storing it there: one copy of the mapping, in the repository that owns the
    // components it describes. Nothing in the guide pipeline knows this document is special.
    expect(guide, 'which-component-when is not bundled').toBeTruthy();
    expect(guide!.lang).toBe('en');
    expect(guide!.sections.length > 15, `only ${guide!.sections.length} sections parsed`).toBeTruthy();
});

test('the tables are read as rows, not as prose', () => {
    const choices = parseChoices(guide!);

    expect(choices.length > 50, `only ${choices.length} rows`).toBeTruthy();

    const multi = choices.find((choice) => choice.task === 'Several values from a closed list');

    expect(multi, 'a known row went missing').toBeTruthy();
    expect(multi!.use).toBe('select + multiple');
    expect(multi!.instead).toBe('autocomplete');
    expect(multi!.why ?? '').toMatch(/no `multiple` input/);
    expect(multi!.cluster).toBe('Pick a value from a set');
});

test('the keyword and component indexes are read too', () => {
    const keywords = parseKeywords(guide);
    const notes = parseComponentNotes(guide);

    // The keyword index sits directly under its own `##` heading with no subsections; slicing past
    // the heading dropped every entry.
    expect(keywords.length > 5, `only ${keywords.length} keyword routes`).toBeTruthy();
    expect(notes.length > 50, `only ${notes.length} component notes`).toBeTruthy();
    expect(keywords.some((route) => route.words.some((word) => word.includes('500')))).toBeTruthy();
});

test('the answer names what not to use, and why not', () => {
    // Naming only the right component leaves the wrong one exactly as plausible as it was.
    const output = toolWhichComponent(catalog, { task: 'several values from a closed list' });

    expect(output).toMatch(/use\s+select \+ multiple/);
    expect(output).toMatch(/not\s+autocomplete/);
    expect(output).toMatch(/why\s+.*multiple/);
    expect(output).toMatch(/get_guide which-component-when/);
});

test('the column naming the wrong component is not scored', () => {
    // It names what must *not* be used, so matching on it ranks a row by the word it warns
    // against: before this, asking for a multi-select put `radio` first because `select` appears
    // in that row as the mistake.
    const got = recommendations('multi-select from 500 options');

    expect(!got[0]!.startsWith('radio'), `"radio" came first: ${got.join(' | ')}`).toBeTruthy();
});

test('a task with nothing to match lists the clusters instead of inventing a component', () => {
    const output = toolWhichComponent(catalog, { task: 'zzzqqq wwwxxx' });

    expect(output).toMatch(/Nothing in the component-choice guide matches/);
    expect(output).toMatch(/Pick a value from a set/);
});

test('the answer stays small enough to call before every component decision', () => {
    for (const [task] of ACCEPTANCE) {
        const output = toolWhichComponent(catalog, { task });

        expect(output.length < 1600, `"${task}" returned ${output.length} chars`).toBeTruthy();
    }
});

test('a compound word is split for prose but never for an identifier', () => {
    // In a sentence `multi-select` has to reach `select`. In an identifier the hyphen belongs to
    // the name: splitting `kbq-alert` yields `kbq`, the prefix of all 1420 symbols in the library.
    expect(compoundParts('multi-select')).toEqual(['multi', 'select']);
    expect(compoundParts('kbq-alert'), 'kbq is too short to be a part').toEqual(['alert']);

    const hits = search(catalog, 'kbq-alert', { limit: 5 });

    expect(
        hits.some((hit) => hit.label.includes('KbqAlert')),
        `the selector search broke: ${hits.map((hit) => hit.label).join(', ')}`
    ).toBeTruthy();
});

test('a rare word outweighs one the guide repeats everywhere', () => {
    const documents = ['free-form values no dictionary', 'the user types a value', 'the user picks a value'];
    const weights = rarity(['free-form', 'user'], documents);

    expect(weights.get('free-form')! > weights.get('user')!).toBeTruthy();
    expect(weights.get('user')! >= 1, 'a common word still has to count for something').toBeTruthy();
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

        expect(
            at >= 0 && at < within,
            `${at < 0 ? `не найден вовсе: ${got.join(' | ')}` : `на #${at + 1}: ${got.slice(0, within + 1).join(' | ')}`}`
        ).toBeTruthy();
    });
}

test('both languages of the guide parse to the same structure', () => {
    // The parts are found by what they contain, not by their headings: `## Разграничение` is not
    // `## Disambiguation`, and matching titles failed silently on every Russian question.
    const ru = pickGuide(catalog.guides(), 'which-component-when', 'ru');

    expect(ru, 'the Russian text is not bundled').toBeTruthy();
    expect(parseChoices(ru).length).toBe(parseChoices(guide).length);
    expect(parseKeywords(ru).length).toBe(parseKeywords(guide).length);
    expect(parseComponentNotes(ru).length).toBe(parseComponentNotes(guide).length);
});

test('the keyword index is not confused with the component index', () => {
    // Both use `→`. The component index uses it in every second line, so a shape test that only
    // looks for an arrow picks the wrong part — and the keyword routing then runs on component
    // descriptions instead of on the words people type.
    const routes = parseKeywords(guide);

    expect(
        routes.every((route) => route.words.every((word) => word.length < 40)),
        'component prose leaked in'
    ).toBeTruthy();
    expect(routes.some((route) => route.words.includes('multiselect'))).toBeTruthy();
});

test('a Russian task is answered from the Russian text', () => {
    const output = toolWhichComponent(catalog, { task: 'выбрать несколько значений из списка' });

    expect(output, 'the answer came back in English').toMatch(/\p{Script=Cyrillic}/u);
    expect(!output.startsWith('The component-choice guide is not bundled')).toBeTruthy();
});
