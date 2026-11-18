import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listEntryPointTypings } from '../src/sources/components';

/**
 * The two projects every test reads from.
 *
 * `REPO` is this monorepo: the source of the guides, the examples and the API history.
 *
 * `CONSUMER` is a project with `@koobiq/components` installed, which is what the live API reader
 * needs. Inside the monorepo there is no such project — the library is the source here, not a
 * dependency — so the tests point at the repository's own `dist/components`. That build has the
 * published layout, the typings of each entry point addressed from `exports`, and it is the
 * artefact that gets published, so testing against it tests the thing consumers actually install.
 *
 * Set `KOOBIQ_TEST_CONSUMER` to use a real installed project instead.
 */

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const BUILT = join(REPO, 'dist', 'components');

export const CONSUMER = process.env['KOOBIQ_TEST_CONSUMER'] ?? REPO;

/**
 * Points the package resolver at the built library, unless a real consumer was named.
 *
 * Module scope on purpose: this runs once, before the first `loadCatalog`, because a test file's
 * top level runs before any of its tests do. The variable is read, not cached, so a test that wants
 * a different version can still set it.
 */
if (!process.env['KOOBIQ_TEST_CONSUMER'] && !process.env['KOOBIQ_COMPONENTS_ROOT'] && existsSync(BUILT)) {
    process.env['KOOBIQ_COMPONENTS_ROOT'] = BUILT;
}

/**
 * True once `dist/components` (or a named real consumer) is there to read.
 *
 * `unit:all` sweeps every `*.spec.ts` under `packages/mcp`, `units.yml` included — a workflow that
 * never builds the library. `dts.spec.ts` and `dts-against-tsc.spec.ts` read the live `.d.ts`, so
 * without this they fail there for a reason the run does not say: skipped names it, and
 * `unit:mcp:dts` still runs them for real once `api.yml` has built the package.
 */
export const componentsAvailable = (): boolean =>
    Boolean(process.env['KOOBIQ_TEST_CONSUMER']) || listEntryPointTypings(BUILT).has('');
