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
 * Usage: node tools/e2e/serve.mjs [--host <host>] [--port <port>] [--skip-build | --build-only]
 *
 * The build runs once at startup, so the bundle is whatever the sources held then: restart this
 * after changing anything it serves. `--skip-build` serves `dist/e2e/browser` as it stands and
 * `--build-only` builds and exits — the image builds itself that way, so the flags cannot drift
 * from a local run.
 */
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { HOST, serve } from '../serve-static.mjs';

const ROOT = resolve('dist/e2e/browser');
const args = process.argv.slice(2);

const option = (name, fallback) => {
    const index = args.indexOf(name);

    return index >= 0 && args[index + 1] !== undefined ? args[index + 1] : fallback;
};

const buildOnly = args.includes('--build-only');

if (buildOnly || !args.includes('--skip-build')) {
    // The CLI entry point resolved from node_modules and run with the current Node binary: no shell,
    // no dependency on which `yarn` or `npx` is on PATH inside the container.
    const ng = createRequire(import.meta.url).resolve('@angular/cli/bin/ng.js');
    const build = spawn(process.execPath, [ng, 'build', 'dev-e2e', '--configuration=production'], {
        stdio: 'inherit'
    });

    // Awaited rather than spawned synchronously: Playwright kills this process when its `webServer`
    // times out or the run is interrupted, and a blocked event loop cannot answer that — `ng` would
    // be left running and still writing dist/e2e under whatever starts next.
    const stop = () => build.kill('SIGTERM');

    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);

    let exit;

    try {
        exit = await once(build, 'exit');
    } catch (error) {
        console.error(`[serve-e2e] Could not run \`ng build dev-e2e\`: ${error.message}`);
        process.exit(1);
    }

    process.off('SIGINT', stop);
    process.off('SIGTERM', stop);

    const [code, signal] = exit;

    // A signal rather than a status is what an out-of-memory kill looks like, and the build's own
    // output stops mid-sentence without saying so.
    if (code !== 0) {
        console.error(
            `[serve-e2e] \`ng build dev-e2e --configuration=production\` ${signal ? `was killed by ${signal}` : 'failed'}.`
        );
        process.exit(code ?? 1);
    }
}

if (buildOnly) {
    process.exit(0);
}

serve({
    label: 'serve-e2e',
    root: ROOT,
    shell: resolve(ROOT, 'index.html'),
    missing: `No index.html in ${ROOT}. Run "ng build dev-e2e --configuration=production" first.`,
    host: option('--host', HOST),
    port: option('--port', 4200)
});
