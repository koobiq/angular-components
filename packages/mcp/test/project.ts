import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The two projects every test reads from.
 *
 * `REPO` is this monorepo: the source of the guides, the examples and the API history.
 *
 * `CONSUMER` is a project with `@koobiq/components` installed, which is what the live API reader
 * needs. Inside the monorepo there is no such project — the library is the source here, not a
 * dependency — so the tests point at the repository's own `dist/components`. That build has the
 * published layout, entry point directories with an `index.d.ts` apiece, and it is the artefact
 * that gets published, so testing against it tests the thing consumers actually install.
 *
 * Set `KOOBIQ_TEST_CONSUMER` to use a real installed project instead.
 */

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const BUILT = join(REPO, 'dist', 'components');

export const CONSUMER = process.env.KOOBIQ_TEST_CONSUMER ?? REPO;

/**
 * Points the package resolver at the built library, unless a real consumer was named.
 *
 * Module scope on purpose: `node:test` loads every file before running anything, so this runs
 * before the first `loadCatalog`. The variable is read, not cached, so a test that wants a
 * different version can still set it.
 */
if (!process.env.KOOBIQ_TEST_CONSUMER && !process.env.KOOBIQ_COMPONENTS_ROOT && existsSync(BUILT)) {
    process.env.KOOBIQ_COMPONENTS_ROOT = BUILT;
}

/** True when the library has not been built, so the API tests have nothing to read. */
export const componentsAvailable = (): boolean =>
    Boolean(process.env.KOOBIQ_TEST_CONSUMER) || existsSync(join(BUILT, 'index.d.ts'));

export const SKIP_WITHOUT_BUILD = componentsAvailable()
    ? undefined
    : { skip: 'run `yarn build:components` first: the live API tests read dist/components' };
