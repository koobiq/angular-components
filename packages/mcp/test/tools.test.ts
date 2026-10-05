import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { indexSkew, loadCatalog } from '../src/catalog.ts';
import { search } from '../src/search.ts';
import { readIcons } from '../src/sources/icons.ts';
import { toolGetComponent, toolGetIcon, toolGetToken, toolSearch } from '../src/tools.ts';
import { CONSUMER } from './project.ts';

/**
 * Runs against the real repository and its real build, not against fixtures: a fixture keeps
 * passing after the upstream shape changes, which is the only failure these tests exist to catch.
 *
 * See `project.ts` for what `CONSUMER` and `REPO` resolve to.
 */

const catalog = loadCatalog(CONSUMER);

test('the index was generated', () => {
    assert.ok(catalog.index.components.length > 50, `only ${catalog.index.components.length} entry points`);
    assert.match(catalog.index.sourceVersion, /^\d+\.\d+\.\d+/);
});

test('resolves each Koobiq package separately, from the project rather than from itself', () => {
    assert.equal(catalog.project.projectRoot, CONSUMER);
    assert.ok(catalog.icons.ok && /^\d+\./.test(catalog.icons.version));
    assert.ok(catalog.tokens.ok && /^\d+\./.test(catalog.tokens.version));
    assert.notEqual(
        catalog.icons.ok && catalog.icons.version,
        catalog.tokens.ok && catalog.tokens.version,
        'the packages are on independent version lines'
    );
});

test('a package root may be handed over directly, for a layout with nothing to walk', () => {
    // This repository builds `@koobiq/components` and never installs it, so there is nothing in
    // `node_modules` to find. The same override covers Yarn PnP, where there is no `node_modules`
    // at all. Without it the live API would be unreadable in exactly the repository that owns it.
    assert.ok(catalog.api(), 'the components package was not resolved');
    assert.match(catalog.api()!.version, /^\d+\.\d+\.\d+/);
    assert.ok(catalog.api()!.entryPoints.length > 50);
});

test('finds a component by its selector', () => {
    const hit = search(catalog, 'kbq-alert').find((it) => it.label === 'KbqAlert');

    assert.ok(hit, 'KbqAlert not found by selector');
    assert.equal(hit.kind, 'symbol');
});

test('finds an icon by a Russian tag', () => {
    const hits = search(catalog, 'удалить', { kinds: ['icon'], limit: 50 });

    assert.ok(hits.length > 0, 'no icon matched a Russian tag');
    assert.ok(
        hits.some((hit) => hit.ref.startsWith('trash')),
        `expected a trash icon, got ${hits.map((it) => it.ref).join(', ')}`
    );
});

test('sizes that carry no tags upstream borrow them from a sibling', () => {
    assert.ok(catalog.icons.ok);

    const inherited = catalog.icons.data.filter((icon) => icon.tagsInherited);
    const stillUntagged = catalog.icons.data.filter((icon) => icon.tags.length === 0);

    // 172 of 1086 icons ship with no tags; sharing across sizes recovers most of them.
    assert.ok(inherited.length > 120, `only ${inherited.length} icons recovered tags`);
    assert.ok(stillUntagged.length < 50, `${stillUntagged.length} icons remain unsearchable by meaning`);
});

test('get_component returns selectors and inputs, not the whole file', () => {
    const output = toolGetComponent(catalog, { id: 'alert' });

    assert.match(output, /@koobiq\/components\/alert/);
    assert.match(output, /selector: kbq-alert/);
    assert.match(output, /\[input\]\s+alertColor/);
    assert.ok(!/alertColorClass/.test(output), 'protected members leaked into the answer');
    assert.ok(!/ngAcceptInputType/.test(output), 'compiler plumbing leaked into the answer');
    assert.match(output, /@koobiq\/components@\d+\.\d+\.\d+ \(resolved in this project\)/);
});

test('get_component narrows to the members asked for', () => {
    const narrowed = toolGetComponent(catalog, { id: 'select', symbols: ['KbqSelect'], members: ['multiple'] });
    const whole = toolGetComponent(catalog, { id: 'select' });

    assert.match(narrowed, /\[input\]\s+multiple/);
    assert.equal(narrowed.match(/multiple/g)?.length, 1, 'the getter/setter pair was not collapsed');
    assert.ok(narrowed.length < 600, `a targeted answer must stay small, got ${narrowed.length} chars`);
    assert.ok(narrowed.length * 5 < whole.length, `narrowing saved too little: ${narrowed.length} vs ${whole.length}`);
});

test('a documentation group says it has no import path instead of inventing one', () => {
    const output = toolGetComponent(catalog, { id: 'validation' });

    assert.ok(!/from '@koobiq\/components\/validation'/.test(output), 'invented an import path');
    assert.match(output, /documentation group/);
    assert.match(output, /validation-on-submit/);
});

test('get_icon returns the prefixed attribute value, not the bare index key', () => {
    const output = toolGetIcon(catalog, { name: 'trash_16' });

    assert.match(output, /kbq-icon="kbq-trash_16"/);
    assert.match(output, /@koobiq\/icons@/);
});

test('get_icon accepts the name with the prefix already on it', () => {
    assert.match(toolGetIcon(catalog, { name: 'kbq-trash_16' }), /kbq-icon="kbq-trash_16"/);
});

test('get_token reports the value and flags deprecated tokens', () => {
    assert.match(toolGetToken(catalog, { name: 'background-bg' }), /--kbq-background-bg\n {2}value: hsla/);
    assert.match(toolGetToken(catalog, { name: 'theme-default' }), /DEPRECATED/);
});

test('get_token passes on what the package says to use instead', () => {
    assert.ok(catalog.tokens.ok);

    const withNote = catalog.tokens.data.find((token) => token.deprecationNote);

    assert.ok(withNote, 'no deprecation carried a note — the comment parse regressed');
    assert.match(toolGetToken(catalog, { name: withNote.cssName }), /instead: /);
});

test('get_token gives no theming advice of its own', () => {
    // 1862 of 2004 tokens in 3.20.0 are deprecated, most of them component-level ones the package
    // tells callers to replace with global tokens. Repeating the old house rule here would
    // contradict the deprecation note printed alongside it.
    const output = toolGetToken(catalog, { name: 'background-bg' });

    assert.ok(!/redefining/.test(output), 'the tool is dispensing theming advice again');
});

test('an unreadable source refuses instead of answering emptily', () => {
    const broken = readIcons({ name: '@koobiq/icons', version: '99.0.0', root: '/nowhere', major: 99 });

    assert.equal(broken.ok, false);
    assert.match(broken.ok === false ? broken.reason : '', /missing|schema/);
    assert.match(broken.ok === false ? broken.hint : '', /koobiq\.io/);
});

test('a future major is read optimistically and says so', () => {
    const icons = catalog.project.packages.get('@koobiq/icons')!;
    const future = readIcons({ ...icons, version: '99.0.0', major: 99 });

    assert.equal(future.ok, true);
    assert.match(future.ok ? (future.degraded ?? '') : '', /newer than this server knows/);
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
    assert.equal(indexSkew(withComponents('20.3.0', '20.3.0')), null);
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

    assert.match(warning, /untagged checkout at 9efd7ec/);
    assert.match(warning, /14 file\(s\) modified/);
    assert.match(warning, /no published version contains/);
});

test('a patch-level difference is reported as a note', () => {
    const warning = indexSkew(withComponents('20.3.1', '20.3.0')) ?? '';

    assert.match(warning, /project is on 20\.3\.1, index is from 20\.3\.0/);
    assert.ok(!/different major/.test(warning));
});

test('a project on another release line is told the index does not apply', () => {
    const skewed = withComponents('18.4.0', '20.3.0');

    assert.match(indexSkew(skewed) ?? '', /a different major/);
    assert.match(toolGetComponent(skewed, { id: 'alert' }), /VERSION MISMATCH/);
});

test('search says why a source is missing, whether or not something else matched', () => {
    // A query for an icon that comes back with a design token is a miss the caller cannot see: it
    // reads as an answer, and the reason the icons were never searched is not in it.
    const bare = loadCatalog(resolve(import.meta.dirname, '..'));

    for (const query of ['удалить', 'zzzqqq wwwxxx']) {
        assert.match(toolSearch(bare, { query }), /icons unavailable/i, `for "${query}"`);
    }

    assert.ok(!/unavailable/i.test(toolSearch(catalog, { query: 'удалить' })), 'a working source is not announced');
});
