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
import { resolve } from 'node:path';

const DEFAULT_ROOT = 'dist/releases/koobiq-docs/browser';
const DEFAULT_PORT = 4300;

const root = resolve(process.argv[2] ?? DEFAULT_ROOT);
const port = Number(process.env.PORT ?? DEFAULT_PORT);

if (!existsSync(root)) {
    console.error(`[serve-docs] Build output not found at ${root}. Run "yarn run docs:build" first.`);
    process.exit(1);
}

const app = express();

// Mirrors the hosting rewrite in `firebase.json`: routes that were not prerendered fall back to the
// client-side-render shell, NOT to `index.html` (which is the prerendered `/` redirect stub and
// would bounce every unknown URL to the default locale).
const csrShell = resolve(root, 'index.csr.html');
const shell = existsSync(csrShell) ? csrShell : resolve(root, 'index.html');

app.use(express.static(root, { index: 'index.html', redirect: false }));

app.use((request, response) => {
    // A prerendered route is a directory holding its own index.html. Serve it directly rather than
    // letting `express.static` bounce the request to a trailing-slash URL the app never links to.
    const prerendered = resolve(root, `.${decodeURIComponent(request.path)}`, 'index.html');
    const isInsideRoot = prerendered.startsWith(root);

    response.sendFile(isInsideRoot && existsSync(prerendered) ? prerendered : shell);
});

app.listen(port, () => console.log(`[serve-docs] Serving ${root} on http://localhost:${port}`));
