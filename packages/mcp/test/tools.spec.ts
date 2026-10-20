import { resolve } from 'node:path';
import { indexSkew, loadCatalog } from '../src/catalog';
import { search } from '../src/search';
import { readIcons } from '../src/sources/icons';
import { toolGetComponent, toolGetIcon, toolGetToken, toolListComponents, toolSearch } from '../src/tools';
import { CONSUMER } from './project';

/**
 * Runs against the real repository and its real build, not against fixtures: a fixture keeps
 * passing after the upstream shape changes, which is the only failure these tests exist to catch.
 *
 * See `project.ts` for what `CONSUMER` and `REPO` resolve to.
 */

const catalog = loadCatalog(CONSUMER);

test('the index was generated', () => {
    expect(catalog.index.components.length > 50, `only ${catalog.index.components.length} entry points`).toBeTruthy();
    expect(catalog.index.sourceVersion).toMatch(/^\d+\.\d+\.\d+/);
});

test('resolves each Koobiq package separately, from the project rather than from itself', () => {
    expect(catalog.project.projectRoot).toBe(CONSUMER);
    expect(catalog.icons.ok && /^\d+\./.test(catalog.icons.version)).toBeTruthy();
    expect(catalog.tokens.ok && /^\d+\./.test(catalog.tokens.version)).toBeTruthy();
    expect(catalog.icons.ok && catalog.icons.version, 'the packages are on independent version lines').not.toBe(
        catalog.tokens.ok && catalog.tokens.version
    );
});

test('a package root may be handed over directly, for a layout with nothing to walk', () => {
    // This repository builds `@koobiq/components` and never installs it, so there is nothing in
    // `node_modules` to find. The same override covers Yarn PnP, where there is no `node_modules`
    // at all. Without it the live API would be unreadable in exactly the repository that owns it.
    expect(catalog.api(), 'the components package was not resolved').toBeTruthy();
    expect(catalog.api()!.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(catalog.api()!.entryPoints.length > 50).toBeTruthy();
});

test('finds a component by its selector', () => {
    const hit = search(catalog, 'kbq-alert').find((it) => it.label === 'KbqAlert');

    expect(hit, 'KbqAlert not found by selector').toBeTruthy();
    expect(hit!.kind).toBe('symbol');
});

test('finds an icon by a Russian tag', () => {
    const hits = search(catalog, 'удалить', { kinds: ['icon'], limit: 50 });

    expect(hits.length > 0, 'no icon matched a Russian tag').toBeTruthy();
    expect(
        hits.some((hit) => hit.ref.startsWith('trash')),
        `expected a trash icon, got ${hits.map((it) => it.ref).join(', ')}`
    ).toBeTruthy();
});

test('sizes that carry no tags upstream borrow them from a sibling', () => {
    if (!catalog.icons.ok) throw new Error('icons not readable');

    const inherited = catalog.icons.data.filter((icon) => icon.tagsInherited);
    const stillUntagged = catalog.icons.data.filter((icon) => icon.tags.length === 0);

    // 172 of 1086 icons ship with no tags; sharing across sizes recovers most of them.
    expect(inherited.length > 120, `only ${inherited.length} icons recovered tags`).toBeTruthy();
    expect(stillUntagged.length < 50, `${stillUntagged.length} icons remain unsearchable by meaning`).toBeTruthy();
});

test('get_component returns selectors and inputs, not the whole file', () => {
    const output = toolGetComponent(catalog, { id: 'alert' });

    expect(output).toMatch(/@koobiq\/components\/alert/);
    expect(output).toMatch(/selector: kbq-alert/);
    expect(output).toMatch(/\[input\]\s+alertColor/);
    expect(!/alertColorClass/.test(output), 'protected members leaked into the answer').toBeTruthy();
    expect(!/ngAcceptInputType/.test(output), 'compiler plumbing leaked into the answer').toBeTruthy();
    expect(output).toMatch(/@koobiq\/components@\d+\.\d+\.\d+ \(resolved in this project\)/);
});

test('get_component narrows to the members asked for', () => {
    const narrowed = toolGetComponent(catalog, { id: 'select', symbols: ['KbqSelect'], members: ['multiple'] });
    const whole = toolGetComponent(catalog, { id: 'select' });

    expect(narrowed).toMatch(/\[input\]\s+multiple/);
    expect(narrowed.match(/multiple/g)?.length, 'the getter/setter pair was not collapsed').toBe(1);
    expect(narrowed.length < 600, `a targeted answer must stay small, got ${narrowed.length} chars`).toBeTruthy();
    expect(
        narrowed.length * 5 < whole.length,
        `narrowing saved too little: ${narrowed.length} vs ${whole.length}`
    ).toBeTruthy();
});

test('a documentation group says it has no import path instead of inventing one', () => {
    const output = toolGetComponent(catalog, { id: 'validation' });

    expect(!/from '@koobiq\/components\/validation'/.test(output), 'invented an import path').toBeTruthy();
    expect(output).toMatch(/documentation group/);
    expect(output).toMatch(/validation-on-submit/);
});

test('get_icon returns the prefixed attribute value, not the bare index key', () => {
    const output = toolGetIcon(catalog, { name: 'trash_16' });

    expect(output).toMatch(/kbq-icon="kbq-trash_16"/);
    expect(output).toMatch(/@koobiq\/icons@/);
});

test('get_icon accepts the name with the prefix already on it', () => {
    expect(toolGetIcon(catalog, { name: 'kbq-trash_16' })).toMatch(/kbq-icon="kbq-trash_16"/);
});

test('get_token reports the value and flags deprecated tokens', () => {
    expect(toolGetToken(catalog, { name: 'background-bg' })).toMatch(/--kbq-background-bg\n {2}value: hsla/);
    expect(toolGetToken(catalog, { name: 'theme-default' })).toMatch(/DEPRECATED/);
});

test('get_token passes on what the package says to use instead', () => {
    if (!catalog.tokens.ok) throw new Error('tokens not readable');

    const withNote = catalog.tokens.data.find((token) => token.deprecationNote);

    expect(withNote, 'no deprecation carried a note — the comment parse regressed').toBeTruthy();
    expect(toolGetToken(catalog, { name: withNote!.cssName }), 'the tool is dispensing theming advice again').toMatch(
        /instead: /
    );
});

test('get_token gives no theming advice of its own', () => {
    // 1862 of 2004 tokens in 3.20.0 are deprecated, most of them component-level ones the package
    // tells callers to replace with global tokens. Repeating the old house rule here would
    // contradict the deprecation note printed alongside it.
    const output = toolGetToken(catalog, { name: 'background-bg' });

    expect(!/redefining/.test(output)).toBeTruthy();
});

test('an unreadable source refuses instead of answering emptily', () => {
    const broken = readIcons({ name: '@koobiq/icons', version: '99.0.0', root: '/nowhere', major: 99 });

    expect(broken.ok).toBe(false);
    expect(broken.ok === false ? broken.reason : '').toMatch(/missing|schema/);
    expect(broken.ok === false ? broken.hint : '').toMatch(/koobiq\.io/);
});

test('a future major is read optimistically and says so', () => {
    const icons = catalog.project.packages.get('@koobiq/icons')!;
    const future = readIcons({ ...icons, version: '99.0.0', major: 99 });

    expect(future.ok).toBe(true);
    expect(future.ok ? (future.degraded ?? '') : '').toMatch(/newer than this server knows/);
});

/**
 * `angular-components` is the library's own monorepo, so it does not install `@koobiq/components`
 * — the skew path cannot be reached through it and the package is injected here. A fixture
 * consumer project that resolves all three packages is on the list.
 */
const released = (indexVersion: string) => ({
    ...catalog,
    index: {
        ...catalog.index,
        sourceVersion: indexVersion,
        provenance: { version: indexVersion, commit: 'abc1234', tag: indexVersion, dirtyFiles: 0 }
    }
});

const withComponents = (projectVersion: string, indexVersion = catalog.index.sourceVersion) => {
    const base = released(indexVersion);

    return {
        ...base,
        project: {
            ...base.project,
            packages: new Map(base.project.packages).set('@koobiq/components', {
                name: '@koobiq/components',
                version: projectVersion,
                root: '/fixture',
                major: Number(projectVersion.split('.')[0])
            })
        }
    };
};

test('an index built from a tagged release, matching the project, reports nothing', () => {
    expect(indexSkew(withComponents('20.3.0', '20.3.0'))).toBe(null);
});

test('an index built from an untagged checkout says so, whatever the versions', () => {
    // The case that bit in practice: `KbqThemeSelector.Light` exists in the components working tree
    // and in no published 20.x, so the numbers match while the answer does not.
    const fromWorkingTree = {
        ...withComponents('20.3.0', '20.3.0'),
        index: {
            ...catalog.index,
            sourceVersion: '20.3.0',
            provenance: { version: '20.3.0', commit: '9efd7ec', tag: null, dirtyFiles: 14 }
        }
    };

    const warning = indexSkew(fromWorkingTree) ?? '';

    expect(warning).toMatch(/untagged checkout at 9efd7ec/);
    expect(warning).toMatch(/14 file\(s\) modified/);
    expect(warning).toMatch(/no published version contains/);
});

test('a patch-level difference is reported as a note', () => {
    const warning = indexSkew(withComponents('20.3.1', '20.3.0')) ?? '';

    expect(warning).toMatch(/project is on 20\.3\.1, index is from 20\.3\.0/);
    expect(!/different major/.test(warning)).toBeTruthy();
});

test('a project on another release line is told the index does not apply', () => {
    const skewed = withComponents('18.4.0', '20.3.0');

    expect(indexSkew(skewed) ?? '').toMatch(/a different major/);
    expect(toolGetComponent(skewed, { id: 'alert' })).toMatch(/VERSION MISMATCH/);
});

test('search says why a source is missing, whether or not something else matched', () => {
    // A query for an icon that comes back with a design token is a miss the caller cannot see: it
    // reads as an answer, and the reason the icons were never searched is not in it.
    const bare = loadCatalog(resolve(import.meta.dirname, '..'));

    for (const query of ['удалить', 'zzzqqq wwwxxx']) {
        expect(toolSearch(bare, { query }), `for "${query}"`).toMatch(/icons unavailable/i);
    }

    expect(
        !/unavailable/i.test(toolSearch(catalog, { query: 'удалить' })),
        'a working source is not announced'
    ).toBeTruthy();
});

test('lists every documented area, and says it is the whole list', () => {
    const listed = toolListComponents(catalog, {});

    // Split into tokens rather than searched for as substrings: `tree` occurs inside
    // `tree-select`, so containment would pass for an id the answer never names.
    const named = new Set(listed.split(/[\s,]+/));

    for (const entry of catalog.index.components) {
        expect(named.has(entry.id), `${entry.id} is missing`).toBeTruthy();
    }

    expect(listed, 'nothing says the list is closed').toMatch(/complete list/);
    expect(listed.startsWith(`${catalog.index.components.length} documented areas`)).toBeTruthy();
});

test('names the areas that have no entry point to import, rather than implying one', () => {
    const listed = toolListComponents(catalog, {});
    const groups = catalog.index.components.filter((entry) => !entry.importPath).map((entry) => entry.id);

    // `validation` and `forms` are documented pages exported from `core`. The import rule stated
    // at the top of the answer would send an agent to `@koobiq/components/validation`, which is
    // not published — so the exceptions have to be named, not left to the rule.
    expect(
        groups.includes('validation'),
        'fixture drift: validation used to have no entry point of its own'
    ).toBeTruthy();
    for (const id of groups) expect(listed.includes(id), `${id} is not listed as an exception`).toBeTruthy();
});

test('summaries are optional and answer in the language asked for', () => {
    const ids = toolListComponents(catalog, {});
    const summarised = toolListComponents(catalog, { detail: 'summary' });
    const russian = toolListComponents(catalog, { detail: 'summary', lang: 'ru' });

    expect(summarised.length > ids.length * 2, 'the summaries did not arrive').toBeTruthy();
    expect(russian, 'no Russian text in the Russian summaries').toMatch(/[а-я]{4}/);
});

test('an entry point published under a nested path is imported by that path, not by its id', () => {
    // The API report flattens the slash — `scrollbar-deprecated.api.md` describes
    // `@koobiq/components/scrollbar/deprecated` — so deriving the import from the id yields a
    // specifier that resolves to nothing.
    const nested = catalog.index.components.find((entry) => entry.id === 'scrollbar-deprecated');

    expect(nested, 'fixture drift: the deprecated scrollbar entry point is gone').toBeTruthy();
    expect(nested!.importPath).toBe('@koobiq/components/scrollbar/deprecated');
    expect(toolGetComponent(catalog, { id: 'scrollbar-deprecated' })).toMatch(/scrollbar\/deprecated';/);
});

test('the live reader finds entry points nested inside another one', () => {
    const live = catalog.api();

    if (!live) throw new Error('the components package was not resolved');

    const nested = live.entryPoints.filter((id) => id.includes('/'));

    expect(nested).toEqual(['scrollbar/deprecated', 'splitter/deprecated']);
    // Reading it is the point: a top-level scan reports the entry point as having no API at all.
    expect((live.read('scrollbar/deprecated') ?? []).length > 0, 'nested entry point read as empty').toBeTruthy();
});

test('a whole borrowed API is folded to its names, and expands on request', () => {
    // `KbqNavbarBrand` declares a couple of inputs of its own and borrows a dozen more from the
    // tooltip trigger. Printed in full, for it and `KbqNavbarItem` both, those were two thirds of
    // the answer for `navbar`.
    //
    // Which mechanism carries them is not asserted: the tooltip arrives through `extends` in
    // 20.3.1 and as a host directive in 20.4.0, and a test pinned to either would fail on a
    // release that only moved it.
    const folded = toolGetComponent(catalog, { id: 'navbar' });
    const whole = toolGetComponent(catalog, { id: 'navbar', include: ['inherited'] });
    const fold = /^ {2}\+(\d+) (?:inherited from|via host directive) (\S+): (.+)$/m.exec(folded);

    expect(fold, 'nothing was folded in navbar').toBeTruthy();

    const [, count, , names] = fold!;

    expect(names!.split(', ').length, 'the count has to match the names beside it').toBe(Number(count));
    expect(Number(count) >= 5, `folded a group of only ${count}`).toBeTruthy();

    const first = names!.split(', ')[0]!;

    expect(
        !new RegExp(`\\[input\\] {2}${first}\\b`).test(folded),
        'a folded binding is not also printed in full'
    ).toBeTruthy();
    expect(whole, 'include: ["inherited"] must expand it').toMatch(new RegExp(`\\[(input|output)\\] *${first}\\b`));
    expect(
        !/\+\d+ (inherited from|via host directive) \S+: /.test(whole),
        'nothing folds once types were asked for'
    ).toBeTruthy();
    expect(
        folded.length < whole.length * 0.8,
        `folding saved only ${whole.length - folded.length} characters`
    ).toBeTruthy();
});

test('a couple of borrowed inputs stay inline, where folding would cost a call to say nothing', () => {
    // The group sizes separate cleanly: an origin contributes 1 to 3 bindings, or 6 to 28. The
    // small end is an inherited `color` or `tabIndex` — the input most callers came for.
    expect(toolGetComponent(catalog, { id: 'navbar' })).toMatch(/\[input\] {2}tabIndex: .*\(inherited from navbar\)/);
});

test('a named member is shown in full even when its whole group would be folded', () => {
    const folded = toolGetComponent(catalog, { id: 'navbar' });
    const names = /^ {2}\+\d+ (?:inherited from|via host directive) \S+: (.+)$/m.exec(folded)?.[1];

    expect(names, 'nothing was folded in navbar').toBeTruthy();

    const member = names!.split(', ')[0]!;
    const targeted = toolGetComponent(catalog, { id: 'navbar', members: [member] });

    expect(targeted).toMatch(new RegExp(`\\[(input|output)\\] *${member}\\b`));
    expect(!/\+\d+ (inherited from|via host directive) \S+: /.test(targeted), 'the caller named it').toBeTruthy();
});
