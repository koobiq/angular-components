/**
 * Builds the e2e app in its production configuration and serves the output as static files. This is
 * the server playwright.config.ts starts for the component suite.
 *
 * Not `ng serve`: Vite appends an inline source map to every JavaScript response — the build's own
 * map when there is one, otherwise a generated identity map carrying the full source — which turns
 * the 4 MB minified bundle into a 23 MB response. Every test loads the app into a fresh browser
 * context, and with tracing on Playwright reads each response body over CDP before it discards
 * script content, so that size was paid twice per test. See docs/e2e-performance.md.
 *
 * Usage: node tools/e2e/serve.mjs [--host <host>] [--port <port>] [--skip-build]
 *
 * `--skip-build` serves whatever `dist/e2e/browser` already holds. The defaults match `ng serve`:
 * `localhost` and 4200.
 */
import express from 'express';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const ROOT = resolve('dist/e2e/browser');
const args = process.argv.slice(2);

const option = (name, fallback) => {
    const index = args.indexOf(name);

    return index >= 0 && args[index + 1] !== undefined ? args[index + 1] : fallback;
};

const host = option('--host', 'localhost');
const port = Number(option('--port', '4200'));

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`[serve-e2e] Invalid port "${option('--port')}": expected an integer between 1 and 65535.`);
    process.exit(1);
}

if (!args.includes('--skip-build')) {
    // The CLI entry point resolved from node_modules and run with the current Node binary: no shell,
    // no dependency on which `yarn` or `npx` is on PATH inside the container.
    const ng = createRequire(import.meta.url).resolve('@angular/cli/bin/ng.js');
    const build = spawnSync(process.execPath, [ng, 'build', 'dev-e2e', '--configuration=production'], {
        stdio: 'inherit'
    });

    if (build.status !== 0) {
        console.error('[serve-e2e] `ng build dev-e2e --configuration=production` failed.');
        process.exit(build.status ?? 1);
    }
}

const shell = resolve(ROOT, 'index.html');

if (!existsSync(shell)) {
    console.error(`[serve-e2e] No index.html in ${ROOT}. Run "ng build dev-e2e --configuration=production" first.`);
    process.exit(1);
}

// Held in memory: the fallback below answers every fixture route with it.
const shellHtml = readFileSync(shell, 'utf8');
const app = express();

app.use(express.static(ROOT, { index: 'index.html', redirect: false }));

// Every route of the app is a client-side route.
app.use((_request, response) => response.type('html').send(shellHtml));

const server = app.listen(port, host, () => console.log(`[serve-e2e] Serving ${ROOT} on http://${host}:${port}`));

server.on('error', (error) => {
    console.error(`[serve-e2e] Could not listen on ${host}:${port}: ${error.message}`);
    process.exit(1);
});
