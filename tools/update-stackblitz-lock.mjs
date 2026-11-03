/**
 * Regenerates `apps/docs/src/assets/stackblitz/package-lock.json` from the `package.json` template next to it.
 *
 * StackBlitz runs the docs examples on WebContainers, where npm resolves every package from scratch without a
 * lockfile and an example takes minutes to start. The lockfile only covers the template: the optional
 * dependencies an example adds are missing from it, and npm resolves just those on top.
 *
 * The Koobiq packages of this repository are left out as well: the release regenerates the lockfile right after it
 * bumps the version, before that version is published, so they would be locked one release behind anyway.
 *
 * The lockfile is resolved in a temporary directory, so the repository's own install is not touched, and from
 * the public registry, because StackBlitz downloads the packages from the `resolved` URLs.
 *
 * Usage: yarn run docs:update-stackblitz-lock (also run by `release:extract-docs-meta`)
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const TEMPLATE_DIR = resolve('apps/docs/src/assets/stackblitz');
const REGISTRY = 'https://registry.npmjs.org/';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

// The same range `DocsStackblitzWriter` puts into the project, from the Angular the docs are built with.
const ngVersion = `^${readJson('node_modules/@angular/core/package.json').version.split('.')[0]}`;

/** The dependencies of the template without the Koobiq packages, which take the `${version}` placeholder. */
const resolvable = (dependencies) =>
    Object.fromEntries(
        Object.entries(dependencies)
            .filter(([, range]) => range !== '${version}')
            .map(([name, range]) => [name, range.replace('${ngVersion}', ngVersion)])
    );

const template = readJson(join(TEMPLATE_DIR, 'package.json'));
const packageJson = {
    ...template,
    dependencies: resolvable(template.dependencies),
    devDependencies: resolvable(template.devDependencies)
};

const workDir = mkdtempSync(join(tmpdir(), 'stackblitz-lock-'));

try {
    writeFileSync(join(workDir, 'package.json'), JSON.stringify(packageJson, null, 4));
    // An empty user config: a scoped registry in ~/.npmrc would take precedence over `--registry`.
    writeFileSync(join(workDir, 'user.npmrc'), '');
    execFileSync(
        'npm',
        [
            'install',
            '--package-lock-only',
            '--ignore-scripts',
            '--no-audit',
            '--no-fund',
            `--registry=${REGISTRY}`
        ],
        {
            cwd: workDir,
            env: { ...process.env, npm_config_userconfig: join(workDir, 'user.npmrc') },
            stdio: 'inherit',
            // npm is a `.cmd` script on Windows, which only a shell can start.
            shell: process.platform === 'win32'
        }
    );
    copyFileSync(join(workDir, 'package-lock.json'), join(TEMPLATE_DIR, 'package-lock.json'));
} finally {
    rmSync(workDir, { recursive: true, force: true });
}
