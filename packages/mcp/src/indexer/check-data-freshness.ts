import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ApiHistory } from '../sources/history.js';
import type { Guide } from '../types.js';
import { guideIdsOnDisk } from './build-guides.js';
import { entryPointsOnDisk } from './build-history.js';
import { repoRoot } from './git.js';

/**
 * Checks the two committed data files against the working tree without touching git.
 *
 * `guides.json` and `history.json` are only regenerated at release time (`post-version-bump`), so
 * between releases a guide can be added or an entry point can be guarded and the commit that did it
 * never runs `build:mcp:data` — the committed data silently forgets both until the next release
 * rebuilds it from the tags. This runs on a plain checkout, in CI or locally, with no fetched tags.
 *
 *   yarn check-mcp-data
 */

const repo = resolve(process.argv[2] ?? repoRoot());
const dataDir = join(repo, 'packages', 'mcp', 'data');

const guides = JSON.parse(readFileSync(join(dataDir, 'guides.json'), 'utf-8')) as Guide[];
const history = JSON.parse(readFileSync(join(dataDir, 'history.json'), 'utf-8')) as ApiHistory;

const errors: string[] = [];

const knownGuides = new Set(guides.map((guide) => guide.id));
const missingGuides = [...guideIdsOnDisk(repo)].filter((id) => !knownGuides.has(id)).sort();

if (missingGuides.length > 0) {
    errors.push(
        `data/guides.json does not know ${missingGuides.join(', ')}: run \`yarn run build:mcp:data\` and commit \`data/guides.json\`.`
    );
}

// Only the ones history.json has never recorded under any release: an entry point untouched since
// its first captured release legitimately never appears as a key, so its absence proves nothing.
const everMentioned = new Set(Object.values(history).flatMap((release) => Object.keys(release)));
const newEntryPoints = [...entryPointsOnDisk(repo)].filter((id) => !everMentioned.has(id)).sort();

if (newEntryPoints.length > 0) {
    errors.push(
        `data/history.json has never recorded ${newEntryPoints.join(', ')}: run \`yarn run build:mcp:data\` and commit \`data/history.json\`.`
    );
}

if (errors.length > 0) {
    for (const error of errors) process.stderr.write(`❌ ${error}\n`);
    process.exitCode = 1;
} else {
    process.stdout.write('✅ data/guides.json and data/history.json are not behind the working tree\n');
}
