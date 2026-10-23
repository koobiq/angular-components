const { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

// `tsc` already emits straight into `dist/mcp/dist` (its `outDir`), the same way ng-packagr emits
// library packages straight into `dist/components`. What's left to assemble here is everything
// `tsc` does not produce: the manifest (version substituted from the root one, as the CLI package
// does it), README, LICENSE, the committed `data/`, and the version substituted into the server's
// own reported version.

const root = resolve(__dirname, '..', '..', '..');
const pkg = resolve(__dirname, '..');
const out = resolve(root, 'dist', 'mcp');

mkdirSync(out, { recursive: true });

const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;

const manifest = JSON.parse(readFileSync(resolve(pkg, 'package.json'), 'utf8'));

manifest.version = version;
writeFileSync(resolve(out, 'package.json'), JSON.stringify(manifest, null, 4) + '\n');

copyFileSync(resolve(pkg, 'README.md'), resolve(out, 'README.md'));

if (existsSync(resolve(root, 'LICENSE'))) copyFileSync(resolve(root, 'LICENSE'), resolve(out, 'LICENSE'));

cpSync(resolve(pkg, 'data'), resolve(out, 'data'), { recursive: true });

const server = resolve(out, 'dist', 'server.js');

writeFileSync(server, readFileSync(server, 'utf8').replaceAll('{{VERSION}}', version));
