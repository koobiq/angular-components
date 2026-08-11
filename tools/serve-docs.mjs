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
import { existsSync, readdirSync } from 'node:fs';
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

app.use(express.static(root, { index: 'index.html', redirect: false }));

// A prerendered route is a directory holding its own index.html, and the build has finished before
// this process starts, so the whole set can be enumerated once instead of being probed per request.
//
// Enumerating also settles path traversal by construction: the request only ever picks a key out of
// this map, and every value in it came from walking `root`. Joining the request path onto `root` by
// hand — even behind a `path.relative` check — leaves the burden of proof on the check.
const prerenderedRoutes = new Map();

for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || entry.name !== 'index.html') continue;

    const route = relative(root, entry.parentPath).split(sep).join('/');

    prerenderedRoutes.set(`/${route}`, resolve(entry.parentPath, entry.name));
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

// The map holds one canonical key per directory, so a trailing slash or a doubled separator has to
// be folded away before the lookup. `normalize` resolves `..` too, but only to build the key: a
// route that climbs out of the tree is simply not in the map, and lands on the shell like any other
// unknown URL.
const routeKey = (path) => {
    const normalized = posix.normalize(path);

    return normalized.length > 1 && normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
};

app.use((request, response) => {
    const path = decodePath(request.path);
    const prerendered = path === null ? undefined : prerenderedRoutes.get(routeKey(path));

    // Serve the prerendered index.html directly rather than letting `express.static` bounce the
    // request to a trailing-slash URL the app never links to.
    response.sendFile(prerendered ?? shell);
});

const server = app.listen(port, HOST, () =>
    console.log(`[serve-docs] Serving ${root} on http://${HOST}:${port} (${prerenderedRoutes.size} prerendered routes)`)
);

// Without a listener a bind failure (e.g. EADDRINUSE) surfaces as a raw unhandled exception, which
// is a lot harder to read in a CI log than the checks above.
server.on('error', (error) => {
    console.error(`[serve-docs] Could not listen on port ${port}: ${error.message}`);
    process.exit(1);
});
