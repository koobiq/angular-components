import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCatalog } from '../src/catalog.ts';
import { parseGuide, titleFromId } from '../src/indexer/parse-guide.ts';
import { findSection, guideCaveat, pickGuide } from '../src/sources/guides.ts';
import { toolGetGuide } from '../src/tools.ts';
import type { Guide } from '../src/types.ts';
import { CONSUMER } from './project.ts';

/**
 * Guides are the one source where being out of date is silent: prose describing a mechanism the
 * installed version does not have still reads like an answer. Only the current text is bundled —
 * the measurement behind that is in `types.ts` — so what is asserted here is that the answer always
 * says which release it describes, and that the splitting into sections holds up on real files.
 */

const guide = (over: Partial<Guide> = {}): Guide => ({
    id: 'theming',
    title: 'Theming',
    lang: 'en',
    since: '20.3.1',
    lede: 'lede',
    sections: [{ heading: 'Setup', body: 'body', examples: [] }],
    ...over
});

test('a project on the same major is told nothing extra', () => {
    assert.equal(guideCaveat(guide({ since: '20.0.0' }), '20.3.1'), null);
});

test('a project on another major is warned', () => {
    const warning = guideCaveat(guide({ since: '20.3.1' }), '18.4.0') ?? '';

    assert.match(warning, /from 20\.3\.1 and this project is on 18\.4\.0/);
    assert.match(warning, /different major/);
});

test('a guide that exists only in the working tree says so, whatever the version', () => {
    // `localization` today: written, reviewed, in no release. Serving it with this note beats
    // answering nothing, which is what sent agents to llms.txt in the first place.
    const warning = guideCaveat(guide({ unreleased: true }), '20.3.1') ?? '';

    assert.match(warning, /not in any release yet/);
});

test('the asked-for language wins, and the other is a fallback rather than a miss', () => {
    const both: Guide[] = [
        guide({ lang: 'en' }),
        guide({ lang: 'ru' }),
        guide({ id: 'localization', title: 'Localization', lang: 'ru' })
    ];

    assert.equal(pickGuide(both, 'theming', 'ru')?.lang, 'ru');
    assert.equal(pickGuide(both, 'theming', 'en')?.lang, 'en');
    assert.equal(pickGuide(both, 'localization', 'en')?.lang, 'ru', 'falling back beats answering nothing');
    assert.equal(pickGuide(both, 'nonexistent', 'en'), null);
});

test('a section is found by an exact heading or by part of one', () => {
    const subject = guide({
        sections: [
            { heading: 'Switching themes', body: 'a', examples: [] },
            { heading: 'Theme selectors', body: 'b', examples: [] }
        ]
    });

    const body = (query: string): string | null => {
        const hit = findSection([subject], subject, query);

        return hit.kind === 'found' ? hit.section.body : null;
    };

    assert.equal(body('Theme selectors'), 'b');
    assert.equal(body('switching'), 'a');
    assert.equal(body('nothing like this'), null);
});

test('a heading that repeats is addressed by its parent, not answered with the first match', () => {
    // `Running the migration` occurs once per release in the migration guide. Answering the bare
    // heading with the first match left the subsections of the later releases unreachable by any
    // argument at all — there was nothing to pass that would select them.
    const subject = guide({
        sections: [
            { heading: 'Step one', depth: 3, body: 'one', examples: [] },
            { heading: 'Running the migration', depth: 4, body: 'first', examples: [] },
            { heading: 'Step two', depth: 3, body: 'two', examples: [] },
            { heading: 'Running the migration', depth: 4, body: 'second', examples: [] }
        ]
    });

    const bare = findSection([subject], subject, 'Running the migration');

    assert.equal(bare.kind, 'ambiguous');
    assert.deepEqual(bare.kind === 'ambiguous' ? bare.paths : [], [
        'Step one > Running the migration',
        'Step two > Running the migration'
    ]);

    const body = (query: string): string | null => {
        const hit = findSection([subject], subject, query);

        return hit.kind === 'found' ? hit.section.body : null;
    };

    assert.equal(body('Step two > Running the migration'), 'second');
    assert.equal(body('Step one > Running the migration'), 'first');
    // A unique heading stays addressable on its own: the path is not an extra hoop.
    assert.equal(body('Step one'), 'one');
});

test('a heading quoted in the other language still resolves', () => {
    const en = guide({
        id: 'migration',
        lang: 'en',
        sections: [
            { heading: 'Upgrade plan', depth: 3, body: 'plan', examples: [] },
            { heading: 'After the migration', depth: 3, body: 'after', examples: [] }
        ]
    });

    const ru = guide({
        id: 'migration',
        lang: 'ru',
        sections: [
            { heading: 'План обновления', depth: 3, body: 'план', examples: [] },
            { heading: 'После миграции', depth: 3, body: 'после', examples: [] }
        ]
    });

    const hit = findSection([en, ru], ru, 'Upgrade plan');

    assert.equal(hit.kind, 'found');
    assert.equal(hit.kind === 'found' && hit.section.body, 'план', 'the text must come back in the asked-for language');
    assert.equal(hit.kind === 'found' && hit.viaLang, 'en', 'the answer should say how it was addressed');
});

test('cross-language addressing is refused once the two texts stop lining up', () => {
    // Position is the only link between the two languages. If one gains a heading, answering from
    // the other would return a neighbouring section while looking exactly like a correct answer.
    const en = guide({
        id: 'migration',
        lang: 'en',
        sections: [
            { heading: 'Upgrade plan', depth: 3, body: 'plan', examples: [] },
            { heading: 'Extra', depth: 3, body: 'extra', examples: [] },
            { heading: 'After the migration', depth: 3, body: 'after', examples: [] }
        ]
    });

    const ru = guide({
        id: 'migration',
        lang: 'ru',
        sections: [
            { heading: 'План обновления', depth: 3, body: 'план', examples: [] },
            { heading: 'После миграции', depth: 3, body: 'после', examples: [] }
        ]
    });

    assert.equal(findSection([en, ru], ru, 'After the migration').kind, 'missing');
});

test('a heading inside a fenced block is not a heading', () => {
    const { sections } = parseGuide(
        ['### Real', 'text', '```bash', '# not a heading', '```', '### Also real', 'more'].join('\n')
    );

    assert.deepEqual(
        sections.map((section) => section.heading),
        ['Real', 'Also real']
    );
    assert.match(sections[0]?.body ?? '', /# not a heading/, 'the comment belongs in the snippet');
});

test('both spellings of an example reference are captured', () => {
    // The docs site moved from the comment to the JSX element around 20.3; reading one spelling
    // drops every example link written in the other.
    const { sections } = parseGuide(
        ['### A', '<!-- example(validation-on-open) -->', '### B', '<Example id="theme-css-variables" />'].join('\n')
    );

    assert.deepEqual(sections[0]?.examples, ['validation-on-open']);
    assert.deepEqual(sections[1]?.examples, ['theme-css-variables']);
});

test('text before the first heading becomes the lede, not a nameless section', () => {
    const { lede, sections } = parseGuide(['Intro paragraph.', '', '### First', 'body'].join('\n'));

    assert.equal(lede, 'Intro paragraph.');
    assert.equal(sections.length, 1);
});

test('titles read as prose rather than as file stems', () => {
    assert.equal(titleFromId('search-smart'), 'Search smart');
    assert.equal(titleFromId('angular-20-breaking-changes'), 'Angular 20 breaking changes');
});

test('the bundled guides answer the setup question that sent agents to llms.txt', () => {
    const answer = toolGetGuide(loadCatalog(CONSUMER), { id: 'theming', section: 'prebuilt' });

    assert.match(answer, /@koobiq\/components\/prebuilt-themes\/theme\.css/);
    assert.match(answer, /kbq-app-background/);
    assert.match(answer, /Text as shipped in \d+\.\d+\.\d+/, 'the answer must name the release it describes');
});

test('a guide is read in three narrowing steps, each affordable', () => {
    const catalog = loadCatalog(CONSUMER);
    const listing = toolGetGuide(catalog, {});
    const sections = toolGetGuide(catalog, { id: 'theming' });
    const one = toolGetGuide(catalog, { id: 'theming', section: 'prebuilt' });

    assert.match(listing, /theming/);
    assert.match(listing, /migration/);

    // The narrowing is the whole point: `migration` is 218 KB, and no step here may approach it.
    assert.ok(listing.length < 2000, `listing was ${listing.length} chars`);
    assert.ok(sections.length < 1500, `section list was ${sections.length} chars`);
    assert.ok(one.length < 3000, `one section was ${one.length} chars`);
});

test('the migration guide is split by release, so one upgrade can be read alone', () => {
    const catalog = loadCatalog(CONSUMER);
    const listed = toolGetGuide(catalog, { id: 'migration' });

    assert.match(listed, /\(20\.2\.0\)|Angular 20/, 'sections should be tagged with the release they apply to');
    assert.ok(catalog.guides().find((entry) => entry.id === 'migration')!.sections.length > 10);
});

test('an unknown guide names the real ones instead of guessing', () => {
    const catalog = loadCatalog(CONSUMER);

    assert.match(toolGetGuide(catalog, { id: 'tehming' }), /Unknown guide "tehming"/);
    assert.match(toolGetGuide(catalog, { id: 'tehming' }), /Available: .*theming/);
});

test('only the current text is bundled, and it stays small enough to ship', () => {
    const guides = loadCatalog(CONSUMER).guides();
    const size = Buffer.byteLength(JSON.stringify(guides)) / 1024;

    // Two budgets, not one picked number. Every guide but `migration`, both languages together,
    // currently totals ~235 KB; `migration` itself is trimmed to its release-level headings plus the
    // one "Running the migration" step per item (`trimMigration` in `build-guides.ts`) and currently
    // totals ~180 KB. Each gets slack for a guide growing a paragraph, not for the itemised diff this
    // trim exists to keep out.
    const limit = 260 + 200;

    assert.ok(guides.length >= 14, `only ${guides.length} guides`);
    assert.ok(
        size < limit,
        `guides.json grew to ${Math.round(size)} KB (budget ${limit} KB) — revisions may have crept back in`
    );
});

test('every guide has the same sections in both languages', () => {
    // This is what makes cross-language addressing safe: `findSection` maps a hit in one language
    // onto the other by position. If a translation gains or loses a heading, that mapping starts
    // returning a neighbouring section, and nothing in the answer would look wrong.
    const guides = loadCatalog(CONSUMER).guides();

    for (const id of new Set(guides.map((entry) => entry.id))) {
        const en = guides.find((entry) => entry.id === id && entry.lang === 'en');
        const ru = guides.find((entry) => entry.id === id && entry.lang === 'ru');

        if (!en || !ru) continue;

        assert.equal(ru.sections.length, en.sections.length, `${id} has diverged between en and ru`);
    }
});

test('an English heading reaches the Russian text of the real migration guide', () => {
    // The route that cost four calls in the first recorded session: `migrate` answers in English,
    // the reader asks `get_guide` for the Russian text, and the heading they were handed matches
    // nothing there.
    const answer = toolGetGuide(loadCatalog(CONSUMER), { id: 'migration', section: 'Upgrade plan', lang: 'ru' });

    assert.match(answer, /План обновления/);
    assert.match(answer, /en heading/);
    assert.ok(!/No section/.test(answer), answer.split('\n')[0]);
});

test('a heading repeated across releases lists its addresses instead of picking one', () => {
    const answer = toolGetGuide(loadCatalog(CONSUMER), { id: 'migration', section: 'Запуск миграции', lang: 'ru' });

    assert.match(answer, /names \d+ sections/);
    assert.match(answer, / > Запуск миграции/, 'the addresses offered have to be the composite ones');
});

test('a section listing hands out addresses that work when passed back', () => {
    const catalog = loadCatalog(CONSUMER);
    const listing = toolGetGuide(catalog, { id: 'migration', lang: 'ru' });

    const addresses = listing
        .split('\n')
        .filter((line) => line.startsWith('  ') && line.trim().length > 0)
        .map((line) => line.trim());

    assert.ok(addresses.length > 10, `only ${addresses.length} addresses in the listing`);

    for (const address of addresses) {
        const answer = toolGetGuide(catalog, { id: 'migration', section: address, lang: 'ru' });

        assert.ok(!/^No section|names \d+ sections/m.test(answer), `"${address}" does not resolve`);
    }
});
