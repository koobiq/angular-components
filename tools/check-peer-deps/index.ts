/**
 * Validates the `peerDependencies` of every published package.
 *
 * The repository installs with Yarn 4 (`nodeLinker: node-modules`), which downgrades peer conflicts
 * to warnings. npm >= 7 rejects them outright, so a manifest that is perfectly happy in-repo can
 * still fail `npm install` for every consumer with `ERESOLVE unable to resolve dependency tree`.
 * Nothing else in the release pipeline looks at peer ranges, so this is the only place that catches
 * the drift before publishing.
 */

import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { subset, valid, validRange } from 'semver';

interface PackageJson {
    name?: string;
    version?: string;
    requiredAngularVersion?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
    release?: { packages: string[] };
}

const projectRoot = join(__dirname, '..', '..');
const versionPlaceholder = '{{VERSION}}';
const ngVersionPlaceholder = '{{NG_VERSION}}';

const readJson = (path: string): PackageJson => JSON.parse(readFileSync(path, { encoding: 'utf-8' }));

const rootPackageJson = readJson(join(projectRoot, 'package.json'));

const failures: string[] = [];
const fail = (pkg: string, message: string) => failures.push(`${pkg}: ${message}`);

/**
 * Published packages that legitimately have no peers. Everything else in `release.packages` must
 * declare some, so a manifest that loses the field is reported rather than silently skipped — an
 * unchecked package looks identical to a valid one in the CI log.
 */
const packagesWithoutPeers = ['cli'];

/** Source manifest of every package listed in the root `release.packages`. */
const publishedPackages = (rootPackageJson.release?.packages || [])
    .map((name) => ({ name, path: join(projectRoot, 'packages', name, 'package.json') }))
    .map((pkg) => ({ ...pkg, json: readJson(pkg.path) }))
    .filter((pkg) => {
        if (pkg.json.peerDependencies !== undefined) return true;

        if (!packagesWithoutPeers.includes(pkg.name)) {
            fail(pkg.name, 'is published but declares no peerDependencies — every rule below skips it');
        }

        return false;
    });

/**
 * Resolves the placeholders exactly as `tools/builders/packager/build.ts` does, so this check sees
 * the same ranges the published manifest will carry.
 */
const resolvePlaceholders = (range: string): string =>
    range
        .replace(versionPlaceholder, rootPackageJson.version!)
        .replace(ngVersionPlaceholder, rootPackageJson.requiredAngularVersion!);

/**
 * Ranges that `ng add @koobiq/components` writes into the consumer's `package.json`.
 * Mirrors `packages/schematics/rollup.config.js`, which injects them from the root manifest at
 * build time — which is why a root bump silently desynchronizes from the peer ranges here.
 *
 * `null` marks a dependency whose range the schematic derives from the application it is run in
 * rather than from this repository, so there is no fixed range to cross-check.
 */
const caret = (range: string): string => (range.startsWith('^') ? range : `^${range}`);

const ngAddPath = join(projectRoot, 'packages', 'schematics', 'src', 'ng-add', 'index.ts');
const rollupConfigPath = join(projectRoot, 'packages', 'schematics', 'rollup.config.js');

const schematicInjectedRanges: Record<string, string | null> = {
    // Derived from the consumer's own `@angular/core`, because every `@angular/animations` release
    // pins `@angular/core` exactly. See packages/schematics/src/ng-add/index.ts.
    '@angular/animations': null,
    '@angular/cdk': caret(rootPackageJson.dependencies!['@angular/cdk']),
    '@koobiq/angular-luxon-adapter': caret(rootPackageJson.version!),
    '@koobiq/luxon-date-adapter': caret(rootPackageJson.devDependencies!['@koobiq/luxon-date-adapter']),
    '@koobiq/date-formatter': caret(rootPackageJson.dependencies!['@koobiq/date-formatter']),
    '@koobiq/date-adapter': caret(rootPackageJson.dependencies!['@koobiq/date-adapter']),
    '@koobiq/icons': caret(rootPackageJson.dependencies!['@koobiq/icons']),
    '@koobiq/design-tokens': caret(rootPackageJson.devDependencies!['@koobiq/design-tokens']),
    luxon: caret(rootPackageJson.devDependencies!.luxon),
    // No caret: the scrollbar relies on a specific `overlayscrollbars` build, so the schematic
    // injects the root pin verbatim. See packages/schematics/rollup.config.js.
    overlayscrollbars: rootPackageJson.dependencies!.overlayscrollbars
};

for (const pkg of publishedPackages) {
    const peers = pkg.json.peerDependencies!;

    for (const [dependency, rawRange] of Object.entries(peers)) {
        const range = resolvePlaceholders(rawRange);

        // A leaked `{{...}}` placeholder is not a valid range: npm can never satisfy it.
        if (validRange(range) === null) {
            fail(pkg.name, `peer "${dependency}": "${rawRange}" is not a valid semver range`);
            continue;
        }

        // An exact version pinned across our own packages makes them mutually unsatisfiable as soon
        // as their versions drift — and they are released independently.
        if (dependency.startsWith('@koobiq/') && valid(range) !== null) {
            fail(pkg.name, `peer "${dependency}": "${range}" is an exact pin, use a range (e.g. "^${range}")`);
        }

        // The schematic installs its own range into the consumer's package.json. If the peer range
        // does not accept everything the schematic installs, `ng add` produces an unresolvable tree.
        const injected = schematicInjectedRanges[dependency];

        if (injected && !subset(injected, range)) {
            fail(
                pkg.name,
                `peer "${dependency}": "${range}" does not accept "${injected}", which ` +
                    "`ng add` writes into the consumer's package.json (see packages/schematics/rollup.config.js)"
            );
        }
    }

    for (const dependency of Object.keys(pkg.json.peerDependenciesMeta || {})) {
        if (!(dependency in peers)) {
            fail(pkg.name, `peerDependenciesMeta lists "${dependency}", which is not a peerDependency`);
        }
    }
}

/**
 * `schematicInjectedRanges` mirrors the schematic by hand, so a package added to `ng add` without a
 * matching entry here would silently drop out of the range check above — losing coverage exactly
 * where a new dependency needs it most. Read the schematic back and fail on the drift instead.
 */
const checkSchematicRangesInSync = () => {
    const ngAdd = readFileSync(ngAddPath, { encoding: 'utf-8' });
    const installed = new Set(
        [...ngAdd.matchAll(/addPackageToPackageJson\(\s*tree,\s*'([^']+)'/g)].map((match) => match[1])
    );

    for (const dependency of installed) {
        if (!(dependency in schematicInjectedRanges)) {
            fail('schematics', `\`ng add\` installs "${dependency}", which schematicInjectedRanges does not list`);
        }
    }

    for (const dependency of Object.keys(schematicInjectedRanges)) {
        if (!installed.has(dependency)) {
            fail('schematics', `schematicInjectedRanges lists "${dependency}", which \`ng add\` does not install`);
        }
    }

    // Every `VERSIONS.*` the schematic reads is a build-time string replacement. One missing from
    // rollup's map is not an error anywhere — it just publishes the literal "VERSIONS.FOO" as the
    // installed range, and the schematic's own tests read the source default, so they never see it.
    const rollupConfig = readFileSync(rollupConfigPath, { encoding: 'utf-8' });
    const referenced = new Set([...ngAdd.matchAll(/VERSIONS\.([A-Z_]+)/g)].map((match) => match[1]));

    for (const key of referenced) {
        if (!rollupConfig.includes(`'VERSIONS.${key}'`)) {
            fail(
                'schematics',
                `\`ng add\` reads VERSIONS.${key}, which packages/schematics/rollup.config.js never replaces`
            );
        }
    }
};

checkSchematicRangesInSync();

/** How a package is reached from a source file. Only `value` obliges the consumer to install it. */
type ImportKind = 'value' | 'dynamic' | 'type';

interface ImportRecord {
    packageName: string;
    /** The specifier as written, e.g. `@koobiq/components/scrollbar`. */
    specifier: string;
    /** Path relative to the package root, e.g. `markdown/markdown.service.ts`. */
    file: string;
    kind: ImportKind;
}

/**
 * Files a package publishes. `git ls-files` rather than a `git grep` pathspec: git's default
 * pathspec magic makes `<pkg>/**\/*.ts` skip files sitting directly under the package root — where
 * the barrels live — and makes "matched nothing" indistinguishable from "found nothing".
 */
const listSourceFiles = (packageName: string): string[] => {
    const output = execFileSync('git', ['ls-files', '-z', '--', `packages/${packageName}/`], {
        cwd: projectRoot,
        encoding: 'utf-8'
    });

    return (
        output
            .split('\0')
            .filter(Boolean)
            .filter((file) => /\.(ts|scss)$/.test(file))
            // Tests and dev harnesses are not published, so their imports carry no obligation.
            .filter((file) => !/\.spec\.ts$|(^|\/)e2e\.ts$|\.playwright-spec\.ts$/.test(file))
    );
};

/** Reduces `@scope/pkg/entry-point` and `pkg/entry-point` to the installable package name. */
const toPackageName = (specifier: string): string =>
    specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

const isRelative = (specifier: string): boolean => specifier.startsWith('.') || specifier.startsWith('~');

/**
 * Every package the given file reaches.
 *
 * Comment lines are dropped first: a JSDoc `@example` block that shows an import is prose, not an
 * obligation. The statement patterns are then anchored to the start of a line, which is what keeps
 * a stray quoted specifier inside running text from parsing as an import.
 */
const scanImports = (source: string, file: string): ImportRecord[] => {
    const code = source
        .split('\n')
        .filter((line) => {
            const trimmed = line.trimStart();

            return !trimmed.startsWith('*') && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
        })
        .join('\n');

    const records: ImportRecord[] = [];
    const add = (specifier: string, kind: ImportKind) => {
        if (isRelative(specifier)) return;

        records.push({ packageName: toPackageName(specifier), specifier, file, kind });
    };

    // `import … from '…'` / `export … from '…'`, including the multi-line form. `import type` and
    // `export type` are erased at compile time and oblige the consumer to install nothing.
    //
    // The binding list is matched as "anything without a quote in it", which is what stops the
    // statement from running past its own end: an `export const` of a locale object would otherwise
    // stretch to the first `from'` it finds and report the next string value as a package name.
    for (const match of code.matchAll(/^[ \t]*(?:import|export)\s+(type\s+)?[^']*?\sfrom\s*'([^']+)'/gm)) {
        add(match[2], match[1] ? 'type' : 'value');
    }

    // Side-effect import: `import 'some-polyfill';`.
    for (const match of code.matchAll(/^[ \t]*import\s*'([^']+)'/gm)) {
        add(match[1], 'value');
    }

    // A dynamically imported package still has to be installed for the consumer's bundler to find
    // it — but, unlike a static import, it does not force the package into every consumer's tree.
    for (const match of code.matchAll(/import\(\s*'([^']+)'/g)) {
        add(match[1], 'dynamic');
    }

    // Sass reaches packages the compiler cannot see from TypeScript. Only scoped specifiers count:
    // a bare one (`@use 'theming'`, `@use 'sass:math'`) is a load-path or built-in module in this
    // repository, never a package — so treating it as one would report dozens of phantom peers.
    for (const match of code.matchAll(/^[ \t]*@(?:use|forward|import)\s+'(@[^']+)'/gm)) {
        add(match[1], 'value');
    }

    return records;
};

/**
 * The entry point a file belongs to — `markdown/markdown.service.ts` is published as
 * `@koobiq/components/markdown`. Files directly under the package root belong to the root entry
 * point, which every consumer loads.
 */
const entryPointOf = (file: string): string => (file.includes('/') ? file.split('/')[0] : '');

/** Entry points every consumer of the package ends up loading, so nothing they import is avoidable. */
const alwaysLoadedEntryPoints = ['', 'core'];

/**
 * Entry points that another entry point pulls in, directly or transitively.
 *
 * Cross-entry-point imports are written as `@koobiq/components/scrollbar`, so the package's own
 * specifiers describe its internal graph. Importing `overlayscrollbars` from `scrollbar` alone is
 * not enough to call it optional: `content-panel` imports `scrollbar`, so a consumer who only ever
 * touches `content-panel` still needs it.
 */
const entryPointsReachableFromOthers = (records: ImportRecord[], packageName: string): Set<string> => {
    const edges = new Map<string, Set<string>>();

    for (const record of records) {
        if (record.packageName !== packageName) continue;
        // Only a static value import drags another entry point in. `import type` is erased before
        // the consumer loads anything, and a dynamic import is the very "import it lazily" escape
        // hatch the optional-peer rule below points at — counting either would let this check
        // reject an optional peer that consumers really can avoid.
        if (record.kind !== 'value') continue;

        const from = entryPointOf(record.file);
        const to = record.specifier.slice(packageName.length).replace(/^\//, '').split('/')[0];

        if (from === to) continue;

        edges.set(from, (edges.get(from) || new Set()).add(to));
    }

    const reachable = new Set<string>();

    for (const start of edges.keys()) {
        const queue = [...(edges.get(start) || [])];

        while (queue.length > 0) {
            const next = queue.shift()!;

            if (next === start || reachable.has(next)) continue;

            reachable.add(next);
            queue.push(...(edges.get(next) || []));
        }
    }

    return reachable;
};

/**
 * Every module the published bundles import but do not declare is a "Module not found" for
 * consumers, and every optional peer they cannot actually run without is the same failure with a
 * reassuring manifest in front of it.
 */
const checkImports = (pkg: { name: string; json: PackageJson }) => {
    const peers = pkg.json.peerDependencies || {};
    const declared = new Set([...Object.keys(peers), ...Object.keys(pkg.json.dependencies || {})]);
    const files = listSourceFiles(pkg.name);

    if (files.length === 0) {
        fail(pkg.name, 'no source files found — the import check silently stopped checking anything');

        return;
    }

    const records = files.flatMap((file) =>
        scanImports(
            readFileSync(join(projectRoot, file), { encoding: 'utf-8' }),
            file.replace(`packages/${pkg.name}/`, '')
        )
    );

    const undeclared = new Set<string>();

    for (const record of records) {
        // A package cannot depend on itself: `@koobiq/components/core` is an entry point, not a peer.
        // Compared exactly, so a sibling like `@koobiq/components-experimental` is still checked.
        if (record.packageName === pkg.json.name) continue;
        if (record.kind === 'type') continue;
        if (declared.has(record.packageName)) continue;

        undeclared.add(record.packageName);
    }

    for (const packageName of [...undeclared].sort()) {
        fail(pkg.name, `imports "${packageName}" but does not declare it as a dependency or peerDependency`);
    }

    // An optional peer is a promise that the library still works without it. That only holds when
    // every entry point statically importing it is one a consumer can decline to import: not the
    // root, not `core`, and not one that another entry point drags in behind their back.
    const pulledInByOthers = entryPointsReachableFromOthers(records, pkg.json.name!);

    for (const [dependency, meta] of Object.entries(pkg.json.peerDependenciesMeta || {})) {
        if (!meta?.optional) continue;

        const entryPoints = [
            ...new Set(
                records
                    .filter((record) => record.packageName === dependency && record.kind === 'value')
                    .map((record) => entryPointOf(record.file))
            )
        ];

        const unavoidable = entryPoints.filter(
            (entryPoint) => alwaysLoadedEntryPoints.includes(entryPoint) || pulledInByOthers.has(entryPoint)
        );

        if (unavoidable.length > 0) {
            fail(
                pkg.name,
                `peer "${dependency}" is optional, but it is statically imported from ` +
                    `${unavoidable.map((entryPoint) => entryPoint || 'the package root').join(', ')}, ` +
                    'which a consumer cannot avoid loading — make it mandatory or import it lazily'
            );
        }
    }
};

publishedPackages.forEach(checkImports);

if (failures.length > 0) {
    console.error('\n❌ peerDependencies validation failed:\n');
    failures.forEach((failure) => console.error(`  - ${failure}`));
    console.error(
        '\nThese manifests resolve under Yarn but break `npm install` for consumers.\n' +
            'See tools/check-peer-deps/index.ts for what each rule protects against.\n'
    );
    process.exit(1);
}

console.log(`✅ peerDependencies are valid for: ${publishedPackages.map((pkg) => pkg.name).join(', ')}`);
