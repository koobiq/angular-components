/**
 * Ratchets on public API entries and members with no description.
 *
 * `tools/api-gen` already filters `@docs-private`/`@internal` out of the manifest it writes to
 * `dist/docs-content/api-manifest/*.json` (see `tools/api-gen/manifest/helpers.ts`'s `isPublic`), so every
 * entry and member surviving into that JSON is one a reader of `/api` or `llms-full.txt` is meant to see —
 * this tool only asks whether it also has a description. It does not forbid an empty one; it fixes the
 * current count per entry point and fails when it grows, so the ongoing cleanup cannot be silently undone
 * by the next feature. Modelled directly on `tools/check-public-api-any`.
 *
 * Run `yarn run check-api-docs` to verify, `yarn run approve-api-docs` to record the new counts after adding
 * descriptions. Needs a fresh `yarn run docs:api-gen` first — the manifest it reads is that command's output.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DocEntry, EntryType, MemberEntry } from '../api-gen/rendering/entities';
import { orderMembers } from '../api-gen/rendering/signature';
import { normalizeFunctionFields } from '../api-gen/rendering/transforms/normalize-function-fields';

const projectRoot = join(__dirname, '..', '..');
const manifestDir = join(projectRoot, 'dist', 'docs-content', 'api-manifest');
const baselinePath = join(__dirname, 'baseline.json');

const approve = process.argv.includes('--approve');

const hasDescription = (entry: { description?: string }): boolean => !!entry.description?.trim();

/**
 * Counts the entries and members the API tab shows with an empty description, taken the way it takes them:
 * without the `NgModule`, which it does not list, and with a getter and its setter as one member, described
 * when either of them is. `normalizeFunctionFields` applies the same `signatures[0]` fallback the render
 * layer does — a function or method's description often lives there, not on the entry itself.
 */
function countUndocumented(entries: DocEntry[]): number {
    let count = 0;

    for (const rawEntry of entries) {
        if (rawEntry.entryType === EntryType.NgModule) continue;

        const entry = normalizeFunctionFields(rawEntry);

        if (!hasDescription(entry)) count++;

        for (const member of orderMembers((entry as { members?: MemberEntry[] }).members ?? [])) {
            if (!hasDescription(normalizeFunctionFields(member))) count++;
        }
    }

    return count;
}

const collect = (): Record<string, number> =>
    Object.fromEntries(
        readdirSync(manifestDir)
            .filter((file) => file.endsWith('.json'))
            .map((file): [string, number] => [
                file.replace('.json', ''),
                countUndocumented(JSON.parse(readFileSync(join(manifestDir, file), 'utf8')))
            ])
            .filter(([, count]) => count > 0)
            .sort(([a], [b]) => a.localeCompare(b))
    );

const current = collect();

if (approve) {
    writeFileSync(baselinePath, `${JSON.stringify(current, null, 4)}\n`);

    const total = Object.values(current).reduce((sum, count) => sum + count, 0);

    console.log(`✅ Recorded ${total} undocumented public members across ${Object.keys(current).length} entry points.`);
    process.exit(0);
}

const baseline: Record<string, number> = JSON.parse(readFileSync(baselinePath, 'utf8'));
const entryPoints = [...new Set([...Object.keys(baseline), ...Object.keys(current)])].sort();

const grown = entryPoints.filter((name) => (current[name] ?? 0) > (baseline[name] ?? 0));
const shrunk = entryPoints.filter((name) => (current[name] ?? 0) < (baseline[name] ?? 0));

if (grown.length > 0) {
    console.error('\n❌ The public API gained entries or members with no description:\n');
    grown.forEach((name) => console.error(`  - ${name}: ${baseline[name] ?? 0} → ${current[name] ?? 0}`));
    console.error(
        '\nAdd a description, or tag it `@docs-private` (hides it from the docs, keeps it in the typings) or\n' +
            '`@internal` (removes it from the typings entirely) if it was never meant to be documented.\n'
    );
    process.exit(1);
}

if (shrunk.length > 0) {
    console.error('\n❌ The recorded counts are stale — the surface improved:\n');
    shrunk.forEach((name) => console.error(`  - ${name}: ${baseline[name] ?? 0} → ${current[name] ?? 0}`));
    console.error('\nLock the improvement in with `yarn run approve-api-docs`.\n');
    process.exit(1);
}

const total = Object.values(current).reduce((sum, count) => sum + count, 0);

console.log(
    `✅ No new undocumented public members. ${total} remain across ${Object.keys(current).length} entry points.`
);
