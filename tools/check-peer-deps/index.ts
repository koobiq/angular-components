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

/** Source manifest of every package listed in the root `release.packages`. */
const publishedPackages = (rootPackageJson.release?.packages || [])
    .map((name) => ({ name, path: join(projectRoot, 'packages', name, 'package.json') }))
    .map((pkg) => ({ ...pkg, json: readJson(pkg.path) }))
    .filter((pkg) => pkg.json.peerDependencies !== undefined);

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
 */
const caret = (range: string): string => (range.startsWith('^') ? range : `^${range}`);

const ngAddPath = join(projectRoot, 'packages', 'schematics', 'src', 'ng-add', 'index.ts');
const rollupConfigPath = join(projectRoot, 'packages', 'schematics', 'rollup.config.js');

const schematicInjectedRanges: Record<string, string> = {
    '@angular/animations': caret(rootPackageJson.dependencies!['@angular/animations']),
    '@angular/cdk': caret(rootPackageJson.dependencies!['@angular/cdk']),
    '@koobiq/angular-luxon-adapter': caret(rootPackageJson.version!),
    '@koobiq/date-formatter': caret(rootPackageJson.dependencies!['@koobiq/date-formatter']),
    '@koobiq/date-adapter': caret(rootPackageJson.dependencies!['@koobiq/date-adapter']),
    '@koobiq/icons': caret(rootPackageJson.dependencies!['@koobiq/icons']),
    '@koobiq/design-tokens': caret(rootPackageJson.devDependencies!['@koobiq/design-tokens']),
    luxon: caret(rootPackageJson.devDependencies!.luxon),
    overlayscrollbars: caret(rootPackageJson.dependencies!.overlayscrollbars)
};

const failures: string[] = [];
const fail = (pkg: string, message: string) => failures.push(`${pkg}: ${message}`);

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

    // An optional peer is a promise that the library still works without it. Anything statically
    // imported by the published bundles must stay mandatory.
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

/** Every module the published bundles import but do not declare is a "Module not found" for consumers. */
const checkUndeclaredImports = () => {
    const components = publishedPackages.find((pkg) => pkg.name === 'components');

    if (!components) return;

    const declared = new Set([
        ...Object.keys(components.json.peerDependencies || {}),
        ...Object.keys(components.json.dependencies || {})
    ]);

    let imports: string;

    try {
        imports = execFileSync(
            'git',
            [
                'grep',
                '-hoE',
                // Static `import`/`export ... from '…'` plus lazy `import('…')`: a dynamically
                // imported package still has to be installed for the consumer's bundler to find it.
                // The space after `from` is required — without it prose like `the 'from' date-time`
                // in a comment parses as an import of whatever the next quoted run happens to be.
                "(from +|import\\( *)'(@?[^.'][^']*)'",
                '--',
                'packages/components/**/*.ts',
                // Tests and dev harnesses are not published, so their imports carry no obligation.
                ':!packages/components/**/*.spec.ts',
                ':!packages/components/**/e2e.ts',
                ':!packages/components/**/e2e.playwright-spec.ts'
            ],
            { cwd: projectRoot, encoding: 'utf-8' }
        );
    } catch (error) {
        // Exit code 1 is `git grep`'s "no matches"; anything else means the search never ran, and
        // silently returning would leave this — the only check for undeclared imports — green.
        if ((error as { status?: number }).status !== 1) {
            throw error;
        }

        return;
    }

    const undeclared = new Set<string>();

    for (const line of imports.split('\n')) {
        const match = line.match(/(?:from +|import\( *)'([^']+)'/);

        if (!match) continue;

        const specifier = match[1];

        // Reduce `@scope/pkg/entry-point` and `pkg/entry-point` to the installable package name.
        const packageName = specifier.startsWith('@')
            ? specifier.split('/').slice(0, 2).join('/')
            : specifier.split('/')[0];

        if (packageName.startsWith('@koobiq/components')) continue;
        if (declared.has(packageName)) continue;

        undeclared.add(packageName);
    }

    for (const packageName of [...undeclared].sort()) {
        fail('components', `imports "${packageName}" but does not declare it as a dependency or peerDependency`);
    }
};

checkUndeclaredImports();

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
