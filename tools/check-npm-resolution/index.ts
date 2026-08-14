/**
 * Resolves the built packages with **npm** before they are published.
 *
 * The repository installs with Yarn 4 (`nodeLinker: node-modules`), which downgrades peer conflicts
 * to warnings, so a manifest that breaks `npm install` for every consumer looks perfectly healthy
 * in CI. This check packs `dist/` exactly as `npm publish` would and asks npm to resolve the result
 * against the project shapes consumers actually have.
 *
 * The fixtures are the installation paths the documentation supports: `ng add`, the manual install
 * line, and an application that already carries the Angular packages. A bare
 * `npm install @koobiq/components` into an application without `@angular/animations` is deliberately
 * NOT a fixture — it cannot resolve, and no peer range can make it. Every `@angular/animations`
 * release pins `@angular/core` exactly, and npm picks the highest version in a peer range without
 * backtracking to the one matching the application's Angular, so the package has to be installed by
 * `ng add` (which reads the application's own `@angular/core` range) or by the documented command.
 *
 * Runs on ubuntu in CI. Node >= 20.12 refuses to spawn `npm.cmd` without a shell, so on Windows the
 * calls go through one — hence the quoting in `npm()`.
 */

import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

interface PackageJson {
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    release?: { packages: string[] };
}

const projectRoot = join(__dirname, '..', '..');
const distDir = join(projectRoot, 'dist');

const rootPackageJson: PackageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), { encoding: 'utf-8' }));

const angularVersion = rootPackageJson.dependencies!['@angular/core'];
const cdkVersion = rootPackageJson.dependencies!['@angular/cdk'];

/** Mirrors `version()` in packages/schematics/rollup.config.js, which shapes what `ng add` writes. */
const caret = (range: string): string => (range.startsWith('^') ? range : `^${range}`);

/** The range shape `ng new` writes for the Angular packages, e.g. `20.3.27` -> `^20.3.0`. */
const ngNewRange = (version: string): string => {
    const [major, minor] = version.replace(/^\D+/, '').split('.');

    return `^${major}.${minor}.0`;
};

const angularRange = ngNewRange(angularVersion);

/**
 * A fresh `ng new` application: `@angular/router` is written by the CLI, `@angular/animations` and
 * `@angular/cdk` are not. Getting this shape wrong is what made an earlier version of this check
 * pass — pre-installing the two peers at the monorepo's exact pins hides every conflict they cause.
 */
const ngNewApp = () => ({
    name: 'fixture',
    version: '1.0.0',
    private: true,
    dependencies: {
        '@angular/common': angularRange,
        '@angular/compiler': angularRange,
        '@angular/core': angularRange,
        '@angular/forms': angularRange,
        '@angular/platform-browser': angularRange,
        '@angular/router': angularRange,
        rxjs: '~7.8.0',
        tslib: '^2.8.1',
        'zone.js': '~0.15.0'
    }
});

/**
 * An application that already depends on the Angular packages `@koobiq/components` peers on.
 *
 * The two extra peers carry the same range shape as the rest of the fixture, not this repository's
 * exact pins. Mixing the two makes the fixture contradict itself the moment Angular publishes a
 * patch: everything inherited from `ngNewApp()` floats to the new version, while an exact
 * `@angular/animations` holds `@angular/core` back — `@angular/animations@x.y.z` peers on
 * `@angular/core@x.y.z` exactly — and npm fails on a conflict no `@koobiq/*` package takes part in.
 */
const angularAppWithPeers = () => ({
    ...ngNewApp(),
    dependencies: {
        ...ngNewApp().dependencies,
        '@angular/animations': angularRange,
        '@angular/cdk': ngNewRange(cdkVersion)
    }
});

/**
 * What `ng add @koobiq/components` writes into the consumer's `package.json`.
 * Mirrors packages/schematics/src/ng-add/index.ts; `tools/check-peer-deps` fails when that list and
 * the ranges behind it drift apart.
 */
const ngAddInstalls = [
    // Derived from the application's own `@angular/core`, not from this repository.
    `@angular/animations@${angularRange}`,
    `@angular/cdk@${caret(cdkVersion)}`,
    `@koobiq/luxon-date-adapter@${caret(rootPackageJson.devDependencies!['@koobiq/luxon-date-adapter'])}`,
    `@koobiq/date-formatter@${caret(rootPackageJson.dependencies!['@koobiq/date-formatter'])}`,
    `@koobiq/date-adapter@${caret(rootPackageJson.dependencies!['@koobiq/date-adapter'])}`,
    `@koobiq/icons@${caret(rootPackageJson.dependencies!['@koobiq/icons'])}`,
    `@koobiq/design-tokens@${caret(rootPackageJson.devDependencies!['@koobiq/design-tokens'])}`,
    `luxon@${caret(rootPackageJson.devDependencies!.luxon)}`,
    // Pinned rather than widened: the schematic injects the root pin verbatim for this one.
    `overlayscrollbars@${rootPackageJson.dependencies!.overlayscrollbars}`
];

/**
 * The manual install from docs/guides/installation.en.md.
 *
 * The Angular packages carry the range the guide tells the reader to take from their own
 * `@angular/core`; the rest are bare, exactly as they are copied out of the guide. That makes this
 * fixture sensitive to the registry: a `@koobiq/icons` major outside the declared peer range would
 * fail it. That is the point — the documented command would break for readers at the same moment.
 */
const documentedInstalls = [
    `@angular/cdk@${ngNewRange(cdkVersion)}`,
    `@angular/animations@${angularRange}`,
    // The guide pins this one, because the scrollbar relies on a specific build of it.
    `overlayscrollbars@${rootPackageJson.dependencies!.overlayscrollbars}`,
    '@koobiq/icons',
    '@koobiq/design-tokens',
    '@koobiq/date-adapter',
    '@koobiq/date-formatter',
    '@koobiq/luxon-date-adapter',
    'luxon'
];

const fixtures = [
    {
        name: 'ng-new-app-ng-add',
        description: '`ng add @koobiq/components` into a fresh `ng new` application',
        packageJson: ngNewApp(),
        extraInstalls: ngAddInstalls
    },
    {
        name: 'ng-new-app-documented-install',
        description: 'the manual install from docs/guides/installation.en.md',
        packageJson: ngNewApp(),
        extraInstalls: documentedInstalls
    },
    {
        name: 'angular-20-app',
        description: 'an application already depending on @angular/animations and @angular/cdk',
        packageJson: angularAppWithPeers(),
        extraInstalls: [] as string[]
    },
    {
        name: 'angular-20-app-ng-add-icons',
        description: 'an existing application with the @koobiq/icons range `ng add` installs',
        packageJson: angularAppWithPeers(),
        // The range comes from the root manifest, the way the schematic resolves it at build time —
        // NOT from `@latest`. Pinning to the registry tip would make an unrelated @koobiq/icons
        // release fail this check on every open pull request, for a version nothing has adopted yet.
        extraInstalls: [`@koobiq/icons@${caret(rootPackageJson.dependencies!['@koobiq/icons'])}`]
    }
];

const isWindows = process.platform === 'win32';

interface NpmResult {
    status: number;
    stdout: string;
    /** stdout and stderr together, for matching npm's diagnostics wherever it decided to print them. */
    output: string;
}

const npm = (args: string[], cwd: string): NpmResult => {
    // Node >= 20.12 rejects spawning a `.cmd` without a shell, so Windows goes through one.
    // Paths here come from `mkdtemp` and the workspace, both of which can contain spaces — quote
    // every argument. Quoting is enough on its own: `"` is a reserved character in Windows paths, so
    // no argument can close the quote, and cmd.exe leaves `&`/`|`/`^` alone inside one.
    const result = isWindows
        ? spawnSync(`npm.cmd ${args.map((arg) => `"${arg}"`).join(' ')}`, { cwd, encoding: 'utf-8', shell: true })
        : spawnSync('npm', args, { cwd, encoding: 'utf-8' });

    const stdout = result.stdout || '';
    const stderr = result.stderr || (result.error ? result.error.message : '');

    return { status: result.status ?? 1, stdout, output: `${stdout}${stderr}` };
};

const packageNames = rootPackageJson.release?.packages || [];

// `cli` has no peerDependencies and nothing depends on it; packing it adds nothing to resolve.
const packagesToCheck = packageNames.filter((name) => name !== 'cli');

const missing = packagesToCheck.filter((name) => !existsSync(join(distDir, name, 'package.json')));

if (missing.length > 0) {
    console.error(`❌ Not built: ${missing.join(', ')}. Run the package builds before this check.`);
    process.exit(1);
}

const workDir = mkdtempSync(join(tmpdir(), 'koobiq-npm-resolution-'));

console.log(`Packing ${packagesToCheck.length} package(s) from dist/...`);

const tarballs = packagesToCheck.map((name) => {
    const packed = npm(['pack', join(distDir, name), '--pack-destination', workDir], projectRoot);

    if (packed.status !== 0) {
        console.error(`❌ Could not pack ${name}:\n${packed.output}`);
        process.exit(1);
    }

    // npm prints notices on stderr and the bare filename on stdout.
    return join(workDir, packed.stdout.trim().split('\n').pop()!);
});

const failures: string[] = [];
let sawEresolve = false;

for (const fixture of fixtures) {
    const fixtureDir = join(workDir, fixture.name);

    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(join(fixtureDir, 'package.json'), JSON.stringify(fixture.packageJson, null, 4));

    // All tarballs in one command: the packages peer-depend on each other, so npm has to see them
    // together to satisfy those peers from the local build rather than from the registry.
    const result = npm(
        ['install', '--dry-run', '--no-audit', '--no-fund', ...tarballs, ...fixture.extraInstalls],
        fixtureDir
    );

    // A tree npm knowingly mis-resolved is not a pass. When the root request carries no range npm
    // resolves the conflict by overriding the peer and still exits 0 — which is exactly the class of
    // breakage this check exists to catch, reported as success.
    const overridden = result.output.includes('ERESOLVE overriding peer dependency');

    if (result.status === 0 && !overridden) {
        console.log(`  ✅ ${fixture.name} — ${fixture.description}`);
        continue;
    }

    failures.push(fixture.name);
    sawEresolve = sawEresolve || overridden || result.output.includes('code ERESOLVE');

    console.error(`  ❌ ${fixture.name} — ${fixture.description}`);
    console.error(
        (overridden && result.status === 0 ? '     npm resolved this tree by overriding a peer:\n' : '') +
            result.output.replace(/^/gm, '     ')
    );
}

if (failures.length > 0) {
    console.error(`\nnpm failed to install the built packages in: ${failures.join(', ')}.`);

    // Only claim the diagnosis npm actually reported: a registry outage or a proxy error must not
    // reach the on-call engineer announced as a broken peer range.
    console.error(
        sawEresolve
            ? 'Consumers would get "ERESOLVE unable to resolve dependency tree" on install.\n'
            : 'npm did not report ERESOLVE — check the output above before suspecting the peer ranges.\n'
    );

    process.exit(1);
}

console.log('\n✅ npm resolves the built packages in every fixture.');
