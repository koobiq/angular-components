/**
 * Ratchet on the amount of `any` / `unknown` in the published type surface.
 *
 * The library compiles with `noImplicitAny` off and lints with `@typescript-eslint/no-explicit-any`
 * disabled, so nothing stops an untyped member from reaching consumers — `KbqLocaleService` shipped
 * `getParams(componentName: string): any` for years that way. This tool does not forbid `any`; it fixes
 * the current amount per package and fails when it grows, so that the ongoing cleanup cannot be silently
 * undone by the next feature.
 *
 * Only hand-written declarations are counted. Angular's own emitted members (`ɵfac`, `ɵdir`, `ɵcmp`,
 * `ngAcceptInputType_*`) carry `any` that no author can remove, and counting them would drown the signal.
 *
 * Run `yarn run check-public-api-any` to verify, `yarn run approve-public-api-any` to record the new
 * counts after a cleanup. The golden files it reads are produced by `yarn run approve-api`.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const projectRoot = join(__dirname, '..', '..');
const goldenDir = join(projectRoot, 'tools', 'public_api_guard', 'components');
const baselinePath = join(__dirname, 'baseline.json');

const approve = process.argv.includes('--approve');

/** Members Angular generates into the `.d.ts`; their `any` is not the author's to remove. */
const isGenerated = (line: string): boolean => /ɵ|ngAcceptInputType_/.test(line);

const isComment = (line: string): boolean => /^\s*(\/\/|\*|\/\*)/.test(line);

const countUntyped = (source: string): number =>
    source
        .split('\n')
        .filter((line) => !isGenerated(line) && !isComment(line))
        .reduce((total, line) => total + (line.match(/\b(any|unknown)\b/g) ?? []).length, 0);

const collect = (): Record<string, number> =>
    Object.fromEntries(
        readdirSync(goldenDir)
            .filter((file) => file.endsWith('.api.md'))
            .map((file): [string, number] => [
                file.replace('.api.md', ''),
                countUntyped(readFileSync(join(goldenDir, file), 'utf8'))
            ])
            .filter(([, count]) => count > 0)
            .sort(([a], [b]) => a.localeCompare(b))
    );

const current = collect();

if (approve) {
    writeFileSync(baselinePath, `${JSON.stringify(current, null, 4)}\n`);

    const total = Object.values(current).reduce((sum, count) => sum + count, 0);

    console.log(`✅ Recorded ${total} untyped members across ${Object.keys(current).length} packages.`);
    process.exit(0);
}

const baseline: Record<string, number> = JSON.parse(readFileSync(baselinePath, 'utf8'));
const packages = [...new Set([...Object.keys(baseline), ...Object.keys(current)])].sort();

const grown = packages.filter((name) => (current[name] ?? 0) > (baseline[name] ?? 0));
const shrunk = packages.filter((name) => (current[name] ?? 0) < (baseline[name] ?? 0));

if (grown.length > 0) {
    console.error('\n❌ The published type surface gained `any` / `unknown`:\n');
    grown.forEach((name) => console.error(`  - ${name}: ${baseline[name] ?? 0} → ${current[name] ?? 0}`));
    console.error(
        '\nNarrow the new members instead. The safe direction is to narrow returns and fields, widen\n' +
            "parameters, and never narrow a parameter; where the type is the consumer's to choose, use a\n" +
            'generic with an `any` default rather than a concrete type.\n'
    );
    process.exit(1);
}

if (shrunk.length > 0) {
    console.error('\n❌ The recorded counts are stale — the surface improved:\n');
    shrunk.forEach((name) => console.error(`  - ${name}: ${baseline[name] ?? 0} → ${current[name] ?? 0}`));
    console.error('\nLock the improvement in with `yarn run approve-public-api-any`.\n');
    process.exit(1);
}

const total = Object.values(current).reduce((sum, count) => sum + count, 0);

console.log(`✅ No new untyped members. ${total} remain across ${Object.keys(current).length} packages.`);
