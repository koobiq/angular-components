/**
 * Resolves the built packages with **npm** before they are published.
 *
 * The repository installs with Yarn 4 (`nodeLinker: node-modules`), which downgrades peer conflicts
 * to warnings, so a manifest that breaks `npm install` for every consumer looks perfectly healthy
 * in CI. This check packs `dist/` exactly as `npm publish` would and asks npm to resolve the result
 * against the project shapes consumers actually have.
 *
 * Runs on ubuntu in CI. Node >= 20.12 refuses to spawn `npm.cmd` without a shell, so on Windows the
 * calls go through one — hence the quoting in `npm()`.
 */

import { execFileSync, execSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

interface PackageJson {
    version?: string;
    dependencies?: Record<string, string>;
    release?: { packages: string[] };
}

const projectRoot = join(__dirname, '..', '..');
const distDir = join(projectRoot, 'dist');

const rootPackageJson: PackageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), { encoding: 'utf-8' }));

const angularVersion = rootPackageJson.dependencies!['@angular/core'];
const cdkVersion = rootPackageJson.dependencies!['@angular/cdk'];

/** An Angular app of the given major, as `ng new` would leave it. */
const angularApp = (versions: Record<string, string>) => ({
    name: 'fixture',
    version: '1.0.0',
    private: true,
    dependencies: {
        '@angular/animations': versions.angular,
        '@angular/cdk': versions.cdk,
        '@angular/common': versions.angular,
        '@angular/compiler': versions.angular,
        '@angular/core': versions.angular,
        '@angular/forms': versions.angular,
        '@angular/platform-browser': versions.angular,
        rxjs: '~7.8.0',
        tslib: '^2.8.1'
    }
});

const fixtures = [
    {
        name: 'angular-20-app',
        description: 'an existing Angular 20 application',
        packageJson: angularApp({ angular: angularVersion, cdk: cdkVersion }),
        extraInstalls: [] as string[]
    },
    {
        name: 'angular-20-app-latest-icons',
        description: 'an Angular 20 application pulling the latest @koobiq/icons, as `ng add` does',
        packageJson: angularApp({ angular: angularVersion, cdk: cdkVersion }),
        extraInstalls: ['@koobiq/icons@latest']
    },
    {
        name: 'documented-install',
        description: 'the manual install line from docs/guides/installation.en.md',
        packageJson: angularApp({ angular: angularVersion, cdk: cdkVersion }),
        extraInstalls: [
            '@koobiq/icons',
            '@koobiq/design-tokens',
            '@koobiq/date-adapter',
            '@koobiq/date-formatter',
            'luxon'
        ]
    }
];

const isWindows = process.platform === 'win32';

const npm = (args: string[], cwd: string): string => {
    const encoding = 'utf-8';
    const stdio: ['ignore', 'pipe', 'pipe'] = ['ignore', 'pipe', 'pipe'];

    // Node >= 20.12 rejects spawning a `.cmd` without a shell, so Windows goes through `execSync`.
    // Paths here come from `mkdtemp` and the workspace, both of which can contain spaces — quote
    // every argument.
    return isWindows
        ? execSync(`npm.cmd ${args.map((arg) => `"${arg}"`).join(' ')}`, { cwd, encoding, stdio })
        : execFileSync('npm', args, { cwd, encoding, stdio });
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
    const output = npm(['pack', join(distDir, name), '--pack-destination', workDir], projectRoot);
    const tarball = output.trim().split('\n').pop()!;

    return join(workDir, tarball);
});

let failed = false;

for (const fixture of fixtures) {
    const fixtureDir = join(workDir, fixture.name);

    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(join(fixtureDir, 'package.json'), JSON.stringify(fixture.packageJson, null, 4));

    // All tarballs in one command: the packages peer-depend on each other, so npm has to see them
    // together to satisfy those peers from the local build rather than from the registry.
    const args = ['install', '--dry-run', '--no-audit', '--no-fund', ...tarballs, ...fixture.extraInstalls];

    try {
        npm(args, fixtureDir);
        console.log(`  ✅ ${fixture.name} — ${fixture.description}`);
    } catch (error: any) {
        failed = true;
        console.error(`  ❌ ${fixture.name} — ${fixture.description}`);
        console.error(String(error.stderr || error.message).replace(/^/gm, '     '));
    }
}

if (failed) {
    console.error(
        '\nnpm cannot resolve the built packages. Consumers would get ' +
            '"ERESOLVE unable to resolve dependency tree" on install.\n'
    );
    process.exit(1);
}

console.log('\n✅ npm resolves the built packages in every fixture.');
