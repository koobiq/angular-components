import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCatalog } from '../src/catalog.ts';
import { parseGuide } from '../src/indexer/parse-guide.ts';
import { changesFor, meaningful, migrationSections, summarise, type ApiHistory } from '../src/sources/history.ts';
import { toolMigrate, toolSearch } from '../src/tools.ts';
import type { Guide } from '../src/types.ts';
import { CONSUMER } from './project.ts';

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

    assert.deepEqual(range.releases, ['19.0.0'], '18.5.0 is what the project already has');
    assert.deepEqual(
        range.impact.map((entry) => entry.entryPoint),
        ['select', 'alert'],
        'an entry point that lost API must outrank one that only gained'
    );
});

test('compiler plumbing is not counted as a break', () => {
    // 72 of the 728 removals in the real file are `ngAcceptInputType_*` and `ɵ*`. Counting them
    // reports a break where nothing broke, and inflates the number an upgrade is planned around.
    assert.equal(meaningful({ symbol: 'KbqSelect', member: 'ngAcceptInputType_x', change: 'removed' }), false);
    assert.equal(meaningful({ symbol: 'KbqSelect', member: 'ɵfac', change: 'removed' }), false);
    assert.equal(meaningful({ symbol: 'KbqSelect', member: 'multiple', change: 'updated' }), true);

    const range = summarise(history, '18.5.0', '19.0.0');

    assert.equal(range.totals.removed, 0, 'the only removal in range was compiler plumbing');
    assert.equal(range.totals.updated, 1);
});

test('one entry point reports its own changes, oldest release first within a kind', () => {
    const range = summarise(history, '18.0.0', '20.0.0');
    const changes = changesFor(history, range, 'select');

    assert.deepEqual(
        changes.map((change) => `${change.version} ${change.change} ${change.member}`),
        ['18.5.0 removed old', '19.0.0 updated multiple']
    );
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

    assert.deepEqual(
        dated.map((entry) => entry.heading),
        ['Filter-bar upgrade (20.2.0)']
    );
    assert.deepEqual(undated, [], 'a subsection under a dated parent is not undated');
});

test('a heading nobody could date is surfaced rather than dropped', () => {
    const { sections } = parseGuide(['### Upgrade to Angular 20', 'text'].join('\n'));
    const guide: Guide = { id: 'migration', title: 'Migration', lang: 'en', since: '20.3.1', lede: '', sections };

    assert.deepEqual(migrationSections(guide, summarise(history, '18.0.0', '20.0.0')).undated, [
        'Upgrade to Angular 20'
    ]);
});

test('the real upgrade summary stays readable', () => {
    const output = toolMigrate(catalog, { from: '18.4.0', to: '19.0.0' });

    assert.match(output, /Upgrading @koobiq\/components 18\.4\.0 → 19\.0\.0/);
    assert.match(output, /LOST API/);
    assert.match(output, /get_guide migration/);

    // 18.4.0 → 19.0.0 is 2930 raw changes. The whole point of this tool is not returning them.
    assert.ok(output.length < 2500, `summary was ${output.length} chars`);
});

test('`to` defaults to the version this project resolved', () => {
    const installed = catalog.project.packages.get('@koobiq/components')?.version;

    assert.ok(installed);
    assert.match(
        toolMigrate(catalog, { from: '18.4.0' }),
        new RegExp(`18\\.4\\.0 → ${installed.replace(/\./g, '\\.')}`)
    );
});

test('a backwards or empty range says so instead of returning nothing', () => {
    const output = toolMigrate(catalog, { from: '25.0.0' });

    assert.match(output, /No recorded API changes/);
    assert.match(output, /"from" must be lower than "to"/);
    assert.match(output, /History covers/);
});

test('an entry point that did not change names the ones that did', () => {
    const output = toolMigrate(catalog, { from: '20.0.0', to: '20.1.0', component: 'badge' });

    assert.match(output, /badge did not change/);
    assert.match(output, /Entry points that did: /);
});

test('a component answer gives the old and the new signature, not just the name', () => {
    // 20.0.0 is the signals migration: this is the release a reader most needs spelled out.
    const output = toolMigrate(catalog, { from: '19.8.0', to: '20.0.0', component: 'select' });

    assert.match(output, /KbqSelect\.backdropClass/);
    assert.match(output, /backdropClass: string → backdropClass: InputSignal<string>/);
    assert.ok(!output.includes('ngAcceptInputType'), 'compiler plumbing leaked into the answer');
});

test('removals are listed before updates, whatever release they fall in', () => {
    const output = toolMigrate(catalog, { from: '18.4.0', to: '20.0.0', component: 'tabs' });
    const firstRemoved = output.indexOf('  removed ');
    const firstUpdated = output.indexOf('  updated ');

    assert.ok(firstRemoved > -1 && firstUpdated > -1, 'expected both kinds in this range');
    assert.ok(firstRemoved < firstUpdated, 'what stops compiling must come first');
});

test('when the list is cut short, the answer says which kinds were cut', () => {
    // `core` over two majors is some 670 changes and about a hundred of them are removals — they
    // fill the budget on their own. Silence there reads as "nothing was updated", the opposite of
    // true. The exact counts move with every release, so only the shape is asserted.
    const output = toolMigrate(catalog, { from: '18.4.0', to: '20.0.0', component: 'core' });

    assert.match(output, /more not shown: .*\d+ updated/);
    assert.match(output, /\d{3} changes — \d+ removed/, 'the total has to be stated, whatever it is');
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

        assert.ok(output.includes(`"${expected}"`), `"${query}" did not find ${expected}:\n${output.slice(0, 300)}`);
    }
});

test('a Russian question is answered with the Russian description', () => {
    const output = toolSearch(catalog, { query: 'вкладки', limit: 3 });

    assert.match(output, /\p{Script=Cyrillic}/u, 'the detail line came back in English');
});

test('indexing a second language stayed cheap', () => {
    const russian = catalog.index.components.reduce(
        (total, entry) => total + entry.sectionsRu.length + (entry.summaryRu ? 1 : 0),
        0
    );

    assert.ok(russian > 500, `only ${russian} Russian strings indexed`);
});
