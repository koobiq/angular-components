const { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

// Assembles `dist/mcp` — what the release publishes — from this package's build output and the
// committed `data/`. The version is read from the root manifest and substituted into the copied
// package.json and into the server's own reported version, the same way the CLI package does it.

const root = resolve(__dirname, '..', '..', '..');
const pkg = resolve(__dirname, '..');
const out = resolve(root, 'dist', 'mcp');

mkdirSync(resolve(out, 'dist'), { recursive: true });

const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;

const manifest = JSON.parse(readFileSync(resolve(pkg, 'package.json'), 'utf8'));
manifest.version = version;
writeFileSync(resolve(out, 'package.json'), JSON.stringify(manifest, null, 4) + '\n');

copyFileSync(resolve(pkg, 'README.md'), resolve(out, 'README.md'));

if (existsSync(resolve(root, 'LICENSE'))) copyFileSync(resolve(root, 'LICENSE'), resolve(out, 'LICENSE'));

cpSync(resolve(pkg, 'dist'), resolve(out, 'dist'), { recursive: true });
cpSync(resolve(pkg, 'data'), resolve(out, 'data'), { recursive: true });

const server = resolve(out, 'dist', 'server.js');
writeFileSync(server, readFileSync(server, 'utf8').replaceAll('{{VERSION}}', version));
