/**
 * The static file server behind `yarn run serve:docs` and `yarn run serve:e2e`. Both serve a
 * directory a build has already produced and answer a client-side route it does not hold with a
 * single-page shell; which paths are such routes, and what answers the rest, stays in their wrappers.
 */
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import express from 'express';

// Loopback rather than every interface: the only client is a `webServer` entry in a Playwright
// config, so on a CI runner this would otherwise be reachable across the network for no reason at
// all.
//
// The literal address rather than `localhost`, and the configs dial the same literal: binding to the
// name picks whichever of ::1 and 127.0.0.1 the resolver happens to return first, and a client
// resolving that same name to the other family then cannot connect. The two ends disagreeing is not
// hypothetical — on Windows `localhost` resolves to ::1 first, and a server bound by name there
// refuses connections on 127.0.0.1.
export const HOST = '127.0.0.1';

/**
 * @param {object} options
 * @param {string} options.label Prefix for this server's console output.
 * @param {string} options.root Directory to serve.
 * @param {string} options.shell Single-page shell inside `root`, answered for client-side routes.
 * @param {string} options.missing What to print when `shell` is not there.
 * @param {unknown} options.port
 * @param {string} [options.host]
 * @param {Function[]} [options.middleware] Handlers to run ahead of the static one.
 * @param {(path: string) => boolean} [options.isShellRoute] Whether a path the build holds no file for gets `shell`;
 *   by default every path without a file extension does.
 * @param {string} [options.notFoundPage] Page inside `root` answered with a 404 for any other path.
 * @param {string} [options.suffix] Appended to the startup line.
 */
export const serve = ({
    label,
    root,
    shell,
    missing,
    port,
    host = HOST,
    middleware = [],
    isShellRoute = (path) => !extname(path),
    notFoundPage,
    suffix = ''
}) => {
    const parsed = Number(port);

    // `app.listen` coerces whatever it gets, so an empty or non-numeric port would surface as a bind
    // error naming a port nobody asked for. Reject it here while the offending value is still around.
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        console.error(`[${label}] Invalid port ${JSON.stringify(port)}: expected an integer between 1 and 65535.`);
        process.exit(1);
    }

    // Reading the shell up front means a root without one fails here rather than on the first
    // request, so say which file is missing instead of letting a raw ENOENT stack trace stand as the
    // explanation.
    if (!existsSync(shell)) {
        console.error(`[${label}] ${missing}`);
        process.exit(1);
    }

    // Held in memory rather than re-read per request. Nothing below this line touches the file system
    // on behalf of a request except `express.static`, which is the one thing here built to: a handler
    // of our own that reads a file is an unmetered amount of I/O per request, which is what CodeQL
    // reports as `js/missing-rate-limiting`, and rate-limiting a fixture nobody can reach would be
    // theatre.
    const shellHtml = readFileSync(shell, 'utf8');
    const notFoundHtml = notFoundPage && readFileSync(notFoundPage, 'utf8');
    const app = express();

    for (const handler of middleware) {
        app.use(handler);
    }

    // Dot directories too, as the hosting serves them: the docs publish their Agent Skills under `/.well-known`.
    app.use(express.static(root, { index: 'index.html', redirect: false, dotfiles: 'allow' }));

    // What the static middleware passed on gets the shell when `isShellRoute` takes it for a client-side
    // route — by default any path without a file extension, the line `ng serve` drew — and a 404 otherwise,
    // with `notFoundPage` as its body when there is one. That keeps a missing chunk, icon or font legible
    // as a failed request rather than as a 200 carrying this shell: the browser reports the type mismatch,
    // and a Playwright trace shows the status.
    app.use((request, response, next) => {
        if (isShellRoute(request.path)) {
            response.type('html').send(shellHtml);
        } else if (notFoundHtml) {
            response.status(404).type('html').send(notFoundHtml);
        } else {
            next();
        }
    });

    const server = app.listen(parsed, host, () =>
        console.log(`[${label}] Serving ${root} on http://${host}:${parsed}${suffix}`)
    );

    // Without a listener a bind failure (e.g. EADDRINUSE) surfaces as a raw unhandled exception,
    // which is a lot harder to read in a CI log than the checks above.
    server.on('error', (error) => {
        console.error(`[${label}] Could not listen on ${host}:${parsed}: ${error.message}`);
        process.exit(1);
    });

    return server;
};
