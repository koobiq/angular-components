import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Guide } from '../types.js';
import { guideIdsOnDisk } from './build-guides.js';
import { repoRoot } from './git.js';

/**
 * Checks the committed `guides.json` against the working tree without touching git.
 *
 * `guides.json` is only regenerated at release time (`post-version-bump`), but it also reads guides
 * straight off disk for anything the newest release does not have yet, flagged `unreleased` — so a
 * guide added or renamed on a branch and never run through `build:mcp:data` is missing here, not
 * merely unreleased. This runs on a plain checkout, in CI or locally, with no fetched tags.
 *
 * `history.json` has no equivalent check. Outside a staged release it is built solely from git tags
 * — `tools/public_api_guard` on disk is never read in that path — so its content cannot drift from
 * the working tree between releases; the only way to see it change is for the release pipeline to
 * run, which runs `build:mcp:data` unconditionally every time. A disk-vs-committed-data check here
 * would instead flag every entry point added since the last tag, which is the common case on any
 * branch adding a component, not a sign of anything forgotten.
 *
 *   yarn check-mcp-data
 */

const repo = resolve(process.argv[2] ?? repoRoot());
const dataDir = join(repo, 'packages', 'mcp', 'data');

const guides = JSON.parse(readFileSync(join(dataDir, 'guides.json'), 'utf-8')) as Guide[];

const knownGuides = new Set(guides.map((guide) => guide.id));
const missingGuides = [...guideIdsOnDisk(repo)].filter((id) => !knownGuides.has(id)).sort();

if (missingGuides.length > 0) {
    process.stderr.write(
        `❌ data/guides.json does not know ${missingGuides.join(', ')}: run \`yarn run build:mcp:data\` and commit \`data/guides.json\`.\n`
    );
    process.exitCode = 1;
} else {
    process.stdout.write('✅ data/guides.json is not behind the working tree\n');
}
