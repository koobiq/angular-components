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
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { posix, relative, resolve, sep } from 'node:path';

const DEFAULT_ROOT = 'dist/releases/koobiq-docs/browser';
const DEFAULT_PORT = 4300;
// Loopback rather than every interface: the only client is the `webServer` entry in
// playwright.docs.config.ts, so on a CI runner this would otherwise be reachable across the network
// for no reason at all.
//
// The literal address rather than `localhost`, and playwright.docs.config.ts dials the same literal:
// binding to the name picks whichever of ::1 and 127.0.0.1 the resolver happens to return first, and
// a client resolving that same name to the other family then cannot connect. The two ends disagreeing
// is not hypothetical — on Windows `localhost` resolves to ::1 first, and a server bound by name
// there refuses connections on 127.0.0.1.
const HOST = '127.0.0.1';

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
// Held in memory rather than re-read per request. Nothing below this line touches the file system
// on behalf of a request except `express.static`, which is the one thing here built to: a handler of
// our own that reads a file is an unmetered amount of I/O per request, which is what CodeQL reports
// as `js/missing-rate-limiting`, and rate-limiting a fixture nobody can reach would be theatre.
const shellHtml = readFileSync(shell, 'utf8');

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
app.use((request, _response, next) => {
    const path = decodePath(request.path);

    if (path !== null && !request.path.endsWith('/') && prerenderedRoutes.has(routeKey(path))) {
        // Slash onto the raw path, so percent-encoding survives, and ahead of any query string.
        request.url = `${request.path}/${request.url.slice(request.path.length)}`;
    }

    next();
});

app.use(express.static(root, { index: 'index.html', redirect: false }));

// Anything the static middleware passed on — an unprerendered route, a malformed escape, a path that
// tried to climb out of the tree — is a client-side route as far as this server is concerned.
app.use((_request, response) => response.type('html').send(shellHtml));

const server = app.listen(port, HOST, () =>
    console.log(`[serve-docs] Serving ${root} on http://${HOST}:${port} (${prerenderedRoutes.size} prerendered routes)`)
);

// Without a listener a bind failure (e.g. EADDRINUSE) surfaces as a raw unhandled exception, which
// is a lot harder to read in a CI log than the checks above.
server.on('error', (error) => {
    console.error(`[serve-docs] Could not listen on port ${port}: ${error.message}`);
    process.exit(1);
});
