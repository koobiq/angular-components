/**
 * Serves the prerendered docs build (`yarn run docs:build`) as static files.
 *
 * The docs app is prerendered, not runtime-SSR, so its `dist` output is a plain directory tree: no
 * Node server bundle is emitted. This wrapper exists so the Playwright docs smoke can run against
 * the very artifact CI already builds, instead of paying for a second full `ng serve` pipeline.
 *
 * Usage: node tools/serve-docs.mjs [root] with PORT (default 4300).
 */
import express from 'express';
import { existsSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

const DEFAULT_ROOT = 'dist/releases/koobiq-docs/browser';
const DEFAULT_PORT = 4300;

const root = resolve(process.argv[2] ?? DEFAULT_ROOT);
const port = Number(process.env.PORT ?? DEFAULT_PORT);

if (!existsSync(root)) {
    console.error(`[serve-docs] Build output not found at ${root}. Run "yarn run docs:build" first.`);
    process.exit(1);
}

// `app.listen` coerces whatever it gets, so an empty or non-numeric PORT would surface as a bind
// error naming a port nobody asked for. Reject it here while the offending value is still around.
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`[serve-docs] Invalid PORT "${process.env.PORT}": expected an integer between 1 and 65535.`);
    process.exit(1);
}

const app = express();

// Mirrors the hosting rewrite in `firebase.json`: routes that were not prerendered fall back to the
// client-side-render shell, NOT to `index.html` (which is the prerendered `/` redirect stub and
// would bounce every unknown URL to the default locale).
const csrShell = resolve(root, 'index.csr.html');
const shell = existsSync(csrShell) ? csrShell : resolve(root, 'index.html');

app.use(express.static(root, { index: 'index.html', redirect: false }));

// Malformed percent-encoding (`/%E0%`) makes `decodeURIComponent` throw. Express would turn that
// into a 500; such a URL simply matches nothing on disk, so it belongs on the CSR shell instead.
const decodePath = (path) => {
    try {
        return decodeURIComponent(path);
    } catch {
        return null;
    }
};

app.use((request, response) => {
    const path = decodePath(request.path);

    if (path === null) {
        response.sendFile(shell);

        return;
    }

    // A prerendered route is a directory holding its own index.html. Serve it directly rather than
    // letting `express.static` bounce the request to a trailing-slash URL the app never links to.
    const prerendered = resolve(root, `.${path}`, 'index.html');
    // Compare on path segments, not on the raw string: a `..` segment can escape into a sibling
    // directory whose name merely starts with the root's own (`browser` -> `browser-something`),
    // which a `startsWith` check would wave through. `express.static` blocks traversal itself, but
    // this fallback resolves the path by hand and has to repeat the guard.
    const relativeToRoot = relative(root, prerendered);
    const isInsideRoot = !!relativeToRoot && !relativeToRoot.startsWith('..') && !isAbsolute(relativeToRoot);

    response.sendFile(isInsideRoot && existsSync(prerendered) ? prerendered : shell);
});

const server = app.listen(port, () => console.log(`[serve-docs] Serving ${root} on http://localhost:${port}`));

// Without a listener a bind failure (e.g. EADDRINUSE) surfaces as a raw unhandled exception, which
// is a lot harder to read in a CI log than the checks above.
server.on('error', (error) => {
    console.error(`[serve-docs] Could not listen on port ${port}: ${error.message}`);
    process.exit(1);
});
