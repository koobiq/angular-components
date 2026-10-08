// Packs the library built in the repository's dist/ and installs the tarballs here, as a consumer gets them.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const app = resolve(import.meta.dirname, '..');
const dist = resolve(app, '../../dist');
const tarballs = join(app, '.tarballs');

rmSync(tarballs, { recursive: true, force: true });
mkdirSync(tarballs);

for (const name of ['components', 'angular-luxon-adapter']) {
    execFileSync('npm', ['pack', join(dist, name), '--pack-destination', tarballs], { stdio: 'inherit', shell: true });
}

const files = readdirSync(tarballs).map((file) => join(tarballs, file));

execFileSync('npm', ['install', '--no-save', ...files], { stdio: 'inherit', shell: true, cwd: app });
