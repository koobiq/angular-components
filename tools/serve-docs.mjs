/**
 * Serves the prerendered docs build (`yarn run docs:build`) as static files.
 *
 * The docs app is prerendered, not runtime-SSR, so its `dist` output is a plain directory tree: no
 * Node server bundle is emitted. This wrapper exists so the Playwright docs smoke can run against
 * the very artifact CI already builds, instead of paying for a second full `ng serve` pipeline.
 *
 * Usage: node tools/serve-docs.mjs [root] with PORT (default 4300).
 */
import { existsSync, readdirSync } from 'node:fs';
import { posix, relative, resolve, sep } from 'node:path';
import { serve } from './serve-static.mjs';

const DEFAULT_ROOT = 'dist/releases/koobiq-docs/browser';
const DEFAULT_PORT = 4300;

const root = resolve(process.argv[2] ?? DEFAULT_ROOT);

if (!existsSync(root)) {
    console.error(`[serve-docs] Build output not found at ${root}. Run "yarn run docs:build" first.`);
    process.exit(1);
}

// Mirrors the hosting rewrite in `firebase.json`: routes that were not prerendered fall back to the
// client-side-render shell, NOT to `index.html` (which is the prerendered `/` redirect stub and
// would bounce every unknown URL to the default locale).
const csrShell = resolve(root, 'index.csr.html');
const shell = existsSync(csrShell) ? csrShell : resolve(root, 'index.html');

// A prerendered route is a directory holding its own index.html, and the build has finished before
// this process starts, so the whole set can be enumerated once instead of being probed per request.
//
// Enumerating also settles path traversal by construction: the request only ever looks itself up in
// this set, and every key in it came from walking `root`. Joining the request path onto `root` by
// hand — even behind a `path.relative` check — leaves the burden of proof on the check.
const prerenderedRoutes = new Set();

for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || entry.name !== 'index.html') continue;

    prerenderedRoutes.add(`/${relative(root, entry.parentPath).split(sep).join('/')}`);
}

// Malformed percent-encoding (`/%E0%`) makes `decodeURIComponent` throw. Express would turn that
// into a 500; such a URL simply matches nothing on disk, so it belongs on the CSR shell instead.
const decodePath = (path) => {
    try {
        return decodeURIComponent(path);
    } catch {
        return null;
    }
};

// The set holds one canonical key per directory, so a trailing slash or a doubled separator has to
// be folded away before the lookup. `normalize` resolves `..` too, but only to build the key: a
// route that climbs out of the tree is simply not in the set, and lands on the shell like any other
// unknown URL.
const routeKey = (path) => {
    const normalized = posix.normalize(path);

    return normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
};

// `express.static` already serves a directory's own index.html — but only for a URL that carries the
// trailing slash, and the docs app links to these routes without one. Appending it internally hands
// the request to the static middleware instead of reading the file in a handler of ours. Letting
// `express.static` redirect instead (its default) is the thing this avoids: that would move the app
// to a URL it never links to, in the browser, mid-suite.
const addTrailingSlash = (request, _response, next) => {
    const path = decodePath(request.path);

    if (path !== null && !request.path.endsWith('/') && prerenderedRoutes.has(routeKey(path))) {
        // Slash onto the raw path, so percent-encoding survives, and ahead of any query string.
        request.url = `${request.path}/${request.url.slice(request.path.length)}`;
    }

    next();
};

serve({
    label: 'serve-docs',
    root,
    shell,
    missing: `No index.csr.html or index.html in ${root}. Run "yarn run docs:build" first.`,
    port: process.env.PORT ?? DEFAULT_PORT,
    middleware: [addTrailingSlash],
    suffix: ` (${prerenderedRoutes.size} prerendered routes)`
});
