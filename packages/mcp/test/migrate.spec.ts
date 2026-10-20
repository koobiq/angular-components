import { loadCatalog } from '../src/catalog';
import { parseGuide } from '../src/indexer/parse-guide';
import { compare } from '../src/semver';
import { changesFor, meaningful, migrationSections, summarise, type ApiHistory } from '../src/sources/history';
import { toolMigrate, toolSearch } from '../src/tools';
import type { Guide } from '../src/types';
import { CONSUMER } from './project';

const catalog = loadCatalog(CONSUMER);

const history: ApiHistory = {
    '18.5.0': { select: [{ symbol: 'KbqSelect', member: 'old', change: 'removed' }] },
    '19.0.0': {
        select: [
            {
                symbol: 'KbqSelect',
                member: 'multiple',
                change: 'updated',
                from: 'multiple: boolean',
                to: 'multiple: InputSignal<boolean>'
            },
            { symbol: 'KbqSelect', member: 'ngAcceptInputType_multiple', change: 'removed' }
        ],
        alert: [{ symbol: 'KbqAlert', member: 'fresh', change: 'added' }]
    },
    '20.0.0': { tree: [{ symbol: 'KbqTree', change: 'removed' }] }
};

test('the range excludes the version already installed and includes the target', () => {
    const range = summarise(history, '18.5.0', '19.0.0');

    expect(range.releases, '18.5.0 is what the project already has').toEqual(['19.0.0']);
    expect(
        range.impact.map((entry) => entry.entryPoint),
        'an entry point that lost API must outrank one that only gained'
    ).toEqual(['select', 'alert']);
});

test('compiler plumbing is not counted as a break', () => {
    // 72 of the 728 removals in the real file are `ngAcceptInputType_*` and `ɵ*`. Counting them
    // reports a break where nothing broke, and inflates the number an upgrade is planned around.
    expect(meaningful({ symbol: 'KbqSelect', member: 'ngAcceptInputType_x', change: 'removed' })).toBe(false);
    expect(meaningful({ symbol: 'KbqSelect', member: 'ɵfac', change: 'removed' })).toBe(false);
    expect(meaningful({ symbol: 'KbqSelect', member: 'multiple', change: 'updated' })).toBe(true);

    const range = summarise(history, '18.5.0', '19.0.0');

    expect(range.totals.removed, 'the only removal in range was compiler plumbing').toBe(0);
    expect(range.totals.updated).toBe(1);
});

test('one entry point reports its own changes, oldest release first within a kind', () => {
    const range = summarise(history, '18.0.0', '20.0.0');
    const changes = changesFor(history, range, 'select');

    expect(changes.map((change) => `${change.version} ${change.change} ${change.member}`)).toEqual([
        '18.5.0 removed old',
        '19.0.0 updated multiple'
    ]);
});

test('a migration heading takes the release from its nearest dated ancestor', () => {
    // `#### Running the migration` appears under three different `###` headings in the real guide,
    // each for a different release. Flattened without depth they are indistinguishable.
    const { sections } = parseGuide(
        [
            '### Filter-bar upgrade (20.2.0)',
            'text',
            '#### Running the migration',
            'steps',
            '### Button review (21.0.0)',
            'text',
            '#### Running the migration',
            'other steps'
        ].join('\n')
    );

    const guide: Guide = { id: 'migration', title: 'Migration', lang: 'en', since: '20.3.1', lede: '', sections };
    const { dated, undated } = migrationSections(guide, summarise(history, '20.0.0', '20.3.0'));

    expect(dated.map((entry) => entry.heading)).toEqual(['Filter-bar upgrade (20.2.0)']);
    expect(undated, 'a subsection under a dated parent is not undated').toEqual([]);
});

test('a heading nobody could date is surfaced rather than dropped', () => {
    const { sections } = parseGuide(['### Upgrade to Angular 20', 'text'].join('\n'));
    const guide: Guide = { id: 'migration', title: 'Migration', lang: 'en', since: '20.3.1', lede: '', sections };

    expect(migrationSections(guide, summarise(history, '18.0.0', '20.0.0')).undated).toEqual([
        'Upgrade to Angular 20'
    ]);
});

test('the real upgrade summary stays readable', () => {
    const output = toolMigrate(catalog, { from: '18.4.0', to: '19.0.0' });

    expect(output).toMatch(/Upgrading @koobiq\/components 18\.4\.0 → 19\.0\.0/);
    expect(output).toMatch(/LOST API/);
    expect(output).toMatch(/get_guide migration/);

    // 18.4.0 → 19.0.0 is 2930 raw changes. The whole point of this tool is not returning them.
    expect(output.length < 2500, `summary was ${output.length} chars`).toBeTruthy();
});

test('`to` defaults to the version this project resolved', () => {
    const installed = catalog.project.packages.get('@koobiq/components')?.version;

    expect(installed).toBeTruthy();
    expect(toolMigrate(catalog, { from: '18.4.0' }).includes(`18.4.0 → ${installed}`)).toBeTruthy();
});

test('a backwards or empty range says so instead of returning nothing', () => {
    const output = toolMigrate(catalog, { from: '25.0.0' });

    expect(output).toMatch(/No recorded API changes/);
    expect(output).toMatch(/"from" must be lower than "to"/);
    expect(output).toMatch(/History covers/);
});

test('an entry point that did not change names the ones that did', () => {
    const output = toolMigrate(catalog, { from: '20.0.0', to: '20.1.0', component: 'badge' });

    expect(output).toMatch(/badge did not change/);
    expect(output).toMatch(/Entry points that did: /);
});

test('a component answer gives the old and the new signature, not just the name', () => {
    // 20.0.0 is the signals migration: this is the release a reader most needs spelled out.
    const output = toolMigrate(catalog, { from: '19.8.0', to: '20.0.0', component: 'select' });

    expect(output).toMatch(/KbqSelect\.backdropClass/);
    expect(output).toMatch(/backdropClass: string → backdropClass: InputSignal<string>/);
    expect(!output.includes('ngAcceptInputType'), 'compiler plumbing leaked into the answer').toBeTruthy();
});

test('removals are listed before updates, whatever release they fall in', () => {
    const output = toolMigrate(catalog, { from: '18.4.0', to: '20.0.0', component: 'tabs' });
    const firstRemoved = output.indexOf('  removed ');
    const firstUpdated = output.indexOf('  updated ');

    expect(firstRemoved > -1 && firstUpdated > -1, 'expected both kinds in this range').toBeTruthy();
    expect(firstRemoved < firstUpdated, 'what stops compiling must come first').toBeTruthy();
});

test('when the list is cut short, the answer says which kinds were cut', () => {
    // `core` over two majors is some 670 changes and about a hundred of them are removals — they
    // fill the budget on their own. Silence there reads as "nothing was updated", the opposite of
    // true. The exact counts move with every release, so only the shape is asserted.
    const output = toolMigrate(catalog, { from: '18.4.0', to: '20.0.0', component: 'core' });

    expect(output).toMatch(/more not shown: .*\d+ updated/);
    expect(output, 'the total has to be stated, whatever it is').toMatch(/\d{3} changes — \d+ removed/);
});

test('a Russian question about a component finds it', () => {
    // Before the component pages were indexed in Russian, the only Russian anywhere in the index
    // was icon tags, so every one of these matched nothing.
    const cases: [string, string][] = [
        ['выбрать несколько значений', 'select'],
        ['вкладки', 'tabs'],
        ['хлебные крошки', 'breadcrumbs']
    ];

    for (const [query, expected] of cases) {
        const output = toolSearch(catalog, { query, limit: 5 });

        expect(
            output.includes(`"${expected}"`),
            `"${query}" did not find ${expected}:\n${output.slice(0, 300)}`
        ).toBeTruthy();
    }
});

test('a Russian question is answered with the Russian description', () => {
    const output = toolSearch(catalog, { query: 'вкладки', limit: 3 });

    expect(output, 'the detail line came back in English').toMatch(/\p{Script=Cyrillic}/u);
});

test('indexing a second language stayed cheap', () => {
    const russian = catalog.index.components.reduce(
        (total, entry) => total + entry.sectionsRu.length + (entry.summaryRu ? 1 : 0),
        0
    );

    expect(russian > 500, `only ${russian} Russian strings indexed`).toBeTruthy();
});

test('a `from` below the recorded history says the counts are partial', () => {
    // The history starts where the API reports do. Asked from under that, `summarise` quietly
    // starts at the first release it has: the totals are real but incomplete, and a reader
    // upgrading from 18.0.0 took 670 removals for the whole bill.
    const oldest = Object.keys(catalog.history()).sort(compare)[0];

    expect(oldest && oldest !== '18.0.0', `fixture drift: the history now starts at ${oldest}`).toBeTruthy();

    const below = toolMigrate(catalog, { from: '18.0.0' });

    expect(below).toMatch(/INCOMPLETE/);
    expect(below.includes(`earliest release on record is ${oldest}`), `${below.split('\n')[1]}`).toBeTruthy();
    // Carried into the per-entry-point answer too, which is where the numbers get acted on.
    expect(toolMigrate(catalog, { from: '18.0.0', component: 'select' })).toMatch(/INCOMPLETE/);

    expect(
        !/INCOMPLETE/.test(toolMigrate(catalog, { from: oldest })),
        'the lowest recorded release is in range'
    ).toBeTruthy();
});
