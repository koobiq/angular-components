import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { compare, isRelease, sortReleases } from '../semver.js';
import type { Guide } from '../types.js';
import { dataDir, git, readBlobs, repoRoot } from './git.js';
import { parseGuide, titleFromId } from './parse-guide.js';

/**
 * Builds `data/guides.json` from the newest release of each guide.
 *
 * Guides are not shipped in `@koobiq/components`, so they have to be captured here. The newest
 * release rather than every release: the Russian theming guide has nine distinct texts across
 * 18.0.0–20.4.0, but seven share the same headings and the code inside them does not change at all
 * between 18.4.0 and 20.3.0. Storing all of them cost 888 KB and bought wording.
 *
 * Read from the newest tag, not the working tree, because a checkout names the version it is
 * *developing*: today it would hand a 20.3.0 project the theming rewrite meant for the release
 * after it. A guide that exists only in the working tree is still taken — flagged — because the
 * alternative is answering nothing.
 *
 *   yarn build:mcp:data
 */

/**
 * Guides that describe how to *use* Koobiq.
 *
 * `docs/guides` also holds the contributor documentation — releasing, testing, linting, the
 * contribution checklist. Those are numbered (`06-testing.md`) and are filtered by that rule
 * rather than by being listed here, so adding `09-whatever.md` needs no change in this file.
 *
 * The named guides are listed explicitly because the split is editorial, not structural, and a
 * guide silently missing is the failure this whole step exists to fix. `assertNothingMissed` below
 * shouts when a named guide appears that is in neither list.
 */
const PUBLIC_GUIDES = [
    'installation',
    'theming',
    'localization',
    'validation',
    'schematics',
    'search-smart',
    'angular-20-breaking-changes',
    // Prose counterpart to `data/history.json`: 30 sections, each tagged with the release it
    // applies to. The diff says a member changed; this says what to write instead.
    'migration',
    // Read by `which_component_when`. Kept here rather than in the server so the mapping has one
    // home, in the repository that owns the components it describes.
    'which-component-when'
] as const;

/** Named, public-looking, and deliberately not shipped. */
const WITHHELD: Record<string, string> = {
    versioning: 'states the semver policy; nothing an agent would act on',
    'directory-structure': 'repository layout, only meaningful to contributors',
    'theming-deprecated': 'superseded by theming; shipping it would offer dead advice',
    customization: 'folded into theming at 19.0.0',
    'component-health': 'internal quality tracking'
};

const INTERNAL = /^\d{2}-/;
const GUIDE_FILE = /(?:^|\/)([a-z0-9-]+?)(?:\.(en|ru))?\.mdx?$/;

/** `lang` is null when the file name does not say; the content decides. */
type Located = { id: string; lang: 'en' | 'ru' | null; path: string };

const locate = (paths: string[]): Located[] => {
    const found: Located[] = [];

    for (const path of paths) {
        if (INTERNAL.test(basename(path))) continue;

        const match = GUIDE_FILE.exec(path);
        const id = match?.[1];

        if (!id || !(PUBLIC_GUIDES as readonly string[]).includes(id)) continue;

        found.push({ id, lang: match[2] === 'en' || match[2] === 'ru' ? match[2] : null, path });
    }

    return found;
};

/**
 * Language of a file whose name does not say.
 *
 * Decided by what is in it rather than by the convention of the day. Both guesses are needed: at
 * 18.0.0 `theming.md` opens with "Что нового?" and its translation sat in `theming.en.md`, while
 * `which-component-when.md` today is English with no suffix at all. A positional rule gets one of
 * those wrong whichever way it is written.
 */
const detectLang = (source: string): 'en' | 'ru' => (/\p{Script=Cyrillic}/u.test(source) ? 'ru' : 'en');

/** Guide-shaped files in `docs/guides` that neither list mentions — a new guide nobody decided on. */
export const assertNothingMissed = (repo: string): string[] => {
    if (!existsSync(join(repo, 'docs', 'guides'))) return [];

    const unknown = new Set<string>();

    for (const path of git(repo, ['ls-files', 'docs/guides']).split('\n').filter(Boolean)) {
        if (INTERNAL.test(basename(path))) continue;

        const id = GUIDE_FILE.exec(path)?.[1];

        if (!id || (PUBLIC_GUIDES as readonly string[]).includes(id) || id in WITHHELD) continue;

        unknown.add(id);
    }

    return [...unknown].sort();
};

export const latestRelease = (repo: string): string | null =>
    sortReleases(
        git(repo, ['tag', '--list'])
            .split('\n')
            .map((line) => line.trim())
            .filter((tag) => isRelease(tag) && compare(tag, '18.0.0') >= 0)
    ).at(-1) ?? null;

export const buildGuides = (repo: string): Guide[] => {
    const tag = latestRelease(repo);
    const guides = new Map<string, Guide>();

    const take = (id: string, named: 'en' | 'ru' | null, since: string, source: string, unreleased?: true): void => {
        const lang = named ?? detectLang(source);
        const key = `${id}\t${lang}`;

        if (guides.has(key)) return;

        const { lede, sections } = parseGuide(source);

        if (sections.length === 0 && lede.length === 0) return;

        guides.set(key, {
            id,
            title: titleFromId(id),
            lang,
            since,
            ...(unreleased ? { unreleased } : {}),
            lede,
            sections
        });
    };

    if (tag) {
        const located = locate(git(repo, ['ls-tree', '-r', '--name-only', tag]).split('\n').filter(Boolean));

        for (const [path, source] of readBlobs(
            repo,
            tag,
            located.map((entry) => entry.path)
        )) {
            const entry = located.find((candidate) => candidate.path === path);

            if (entry) take(entry.id, entry.lang, tag, source);
        }
    }

    // Anything the newest release does not have. `localization` is here today: written, reviewed,
    // not yet released. `take` is keyed, so this never overwrites a released text.
    //
    // Untracked files count, as long as they are not ignored. A guide written this morning is not
    // in `git ls-files` yet, and the alternative is a server that silently knows nothing about it
    // until someone remembers to commit. Nothing arbitrary gets in: `locate` only returns ids that
    // `PUBLIC_GUIDES` names, and everything taken here is flagged `unreleased`.
    const { version } = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf-8')) as { version: string };

    const onDisk = [
        ...git(repo, ['ls-files']).split('\n'),
        ...git(repo, ['ls-files', '--others', '--exclude-standard']).split('\n')
    ].filter(Boolean);

    for (const { id, lang, path } of locate(onDisk)) {
        const full = join(repo, path);

        if (existsSync(full)) take(id, lang, version, readFileSync(full, 'utf-8'), true);
    }

    return [...guides.values()].sort((a, b) => a.id.localeCompare(b.id) || a.lang.localeCompare(b.lang));
};

const main = (): void => {
    const repo = resolve(process.argv[2] ?? process.env.KOOBIQ_REPO ?? repoRoot());
    const started = Date.now();
    const guides = buildGuides(repo);

    const outputPath = join(dataDir(), 'guides.json');

    mkdirSync(dataDir(), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(guides) + '\n');

    const sections = guides.reduce((total, guide) => total + guide.sections.length, 0);
    const unreleased = guides.filter((guide) => guide.unreleased).map((guide) => `${guide.id}.${guide.lang}`);
    const missed = assertNothingMissed(repo);

    process.stdout.write(
        [
            outputPath,
            `  from release  ${latestRelease(repo) ?? 'none — working tree only'}`,
            `  guides        ${guides.length} (${new Set(guides.map((guide) => guide.id)).size} ids x languages)`,
            `  sections      ${sections}`,
            `  size          ${Math.round(Buffer.byteLength(JSON.stringify(guides)) / 1024)} KB`,
            `  built in      ${((Date.now() - started) / 1000).toFixed(1)}s`,
            unreleased.length > 0 ? `  unreleased    ${unreleased.join(', ')}` : '',
            ''
        ]
            .filter((line) => line !== '')
            .join('\n') + '\n'
    );

    if (missed.length > 0) {
        process.stderr.write(
            `\nUNCLASSIFIED GUIDE(S): ${missed.join(', ')}\n` +
                `Add each to PUBLIC_GUIDES or to WITHHELD in src/indexer/build-guides.ts.\n` +
                `Until then they are not shipped, and the server will answer as if they do not exist.\n`
        );
        process.exitCode = 1;
    }
};

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) main();
