import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { Icon, SourceResult } from '../types.js';
import type { PackageRef } from './project.js';

/**
 * Reads the icon index out of the consumer's own `@koobiq/icons`.
 *
 * Nothing about the file's shape is assumed: it is validated on every read, and a shape the
 * server does not recognise produces a refusal rather than a guess. This is the whole answer to
 * "what happens when the icons package ships a major" — a reader per major, a schema check, and
 * an honest failure when neither matches.
 */

/**
 * `tags` is an array in 11 and 12 but may also be a bare string in 9 and 10 — 156 of v10's 1066
 * records carry `""` there, and `description` is absent on those same records. Accepting both and
 * folding a string to a list is what lets one reader cover majors 9 through 12; a stricter schema
 * would reject the whole v10 file over its empty strings.
 */
const IconTags = z.union([z.array(z.string()), z.string()]).optional();

const IconRecord = z.object({
    codepoint: z.string().optional(),
    description: z.string().optional(),
    tags: IconTags,
    code: z.unknown().optional()
});

const IconIndexFile = z.record(z.string(), IconRecord);

const toTagList = (tags: z.infer<typeof IconTags>): string[] => {
    if (Array.isArray(tags)) return tags;

    return typeof tags === 'string' && tags.trim() ? [tags.trim()] : [];
};

type Reader = {
    /** Path of the index inside the package, relative to its root. */
    indexPath: string;
    parse: (raw: unknown) => Icon[];
};

const SIZE_SUFFIX = /_(\d+)$/;

const dedupe = (values: string[]): string[] => [...new Set(values)];

/**
 * Sizes of the same icon are separate records and the tags are not spread evenly across them:
 * in 12.3.0, 105 of 524 `_24` records carry none while their `_16` sibling does, which leaves
 * `bsd_24` unsearchable by meaning. Tags are therefore shared across every record with the same
 * base name, and the borrowing is reported per icon so an answer never overstates what was authored.
 */
const shareTagsAcrossSizes = (icons: Icon[]): Icon[] => {
    const byBase = new Map<string, string[]>();

    for (const icon of icons) {
        const base = icon.name.replace(SIZE_SUFFIX, '');
        const merged = [...(byBase.get(base) ?? []), ...icon.tags];

        byBase.set(base, merged);
    }

    return icons.map((icon) => {
        if (icon.tags.length > 0) return { ...icon, tags: dedupe(icon.tags) };

        const base = icon.name.replace(SIZE_SUFFIX, '');
        const inherited = dedupe(byBase.get(base) ?? []);

        return inherited.length > 0 ? { ...icon, tags: inherited, tagsInherited: true } : icon;
    });
};

export const parseIconIndex = (raw: unknown): Icon[] => {
    const parsed = IconIndexFile.parse(raw);

    const icons = Object.entries(parsed).map(([name, record]): Icon => {
        const size = SIZE_SUFFIX.exec(name)?.[1];

        return {
            name,
            size: size ? Number(size) : null,
            codepoint: record.codepoint,
            description: record.description || undefined,
            // The generator emits duplicates — `["aix","aix","ibm","ibm",…]` — in every major.
            tags: dedupe(toTagList(record.tags))
        };
    });

    return shareTagsAcrossSizes(icons);
};

/**
 * Keyed by the package's major.
 *
 * Majors 9 through 12 were each unpacked from npm and compared: same path, same four fields, and
 * the only difference is the `tags` type handled above. They therefore share one reader — a claim
 * of support backed by a check, not by the shapes happening to look alike.
 *
 * Names are not stable across these majors and the reader does not pretend otherwise: 87 names
 * present in 10 are gone in 11 and 99 are new, because the noun and the shape swapped places
 * (`info-circle_16` became `circle-info_16`). Each version is read on its own, so a project on 10
 * is told about the names that exist in 10.
 */
const READERS = new Map<number, Reader>(
    [9, 10, 11, 12].map((major) => [major, { indexPath: join('info', 'kbq-icons-info.json'), parse: parseIconIndex }])
);

const NEWEST_KNOWN_MAJOR = Math.max(...READERS.keys());
const OLDEST_KNOWN_MAJOR = Math.min(...READERS.keys());

const KNOWN_RANGE = `majors ${OLDEST_KNOWN_MAJOR}–${NEWEST_KNOWN_MAJOR}`;

const DOCS_HINT = 'https://koobiq.io/en/icons';

/**
 * An unknown major is still read, with the nearest reader and a warning naming which direction it
 * is off in. Guessing forward is reasonable — the shape has held for four majors — but a project
 * on an older line than any reader covers is the likelier source of silent nonsense, so it says so.
 */
const fallbackFor = (major: number): { reader: Reader; readerMajor: number; note: string } => {
    const ahead = major > NEWEST_KNOWN_MAJOR;
    const readerMajor = ahead ? NEWEST_KNOWN_MAJOR : OLDEST_KNOWN_MAJOR;
    const direction = ahead
        ? `newer than this server knows (${KNOWN_RANGE}), so icons added since may be missing`
        : `older than this server knows (${KNOWN_RANGE}), and icon names changed between majors — verify anything it returns`;

    return {
        reader: READERS.get(readerMajor)!,
        readerMajor,
        note: `read with the major ${readerMajor} reader; the package is ${direction}`
    };
};

export const readIcons = (pkg: PackageRef | undefined): SourceResult<Icon[]> => {
    if (!pkg) {
        return {
            ok: false,
            reason: '@koobiq/icons is not installed in this project',
            hint: 'Install it, or browse the icons at ' + DOCS_HINT
        };
    }

    const exact = READERS.get(pkg.major);
    const fallback = exact ? null : fallbackFor(pkg.major);
    const reader = exact ?? fallback!.reader;

    const indexFile = join(pkg.root, reader.indexPath);

    if (!existsSync(indexFile)) {
        return {
            ok: false,
            reason: `@koobiq/icons@${pkg.version}: ${reader.indexPath} is missing — the package layout changed`,
            hint: `This server knows ${KNOWN_RANGE}. Names must be taken from ${DOCS_HINT}`
        };
    }

    let data: Icon[];

    try {
        data = reader.parse(JSON.parse(readFileSync(indexFile, 'utf-8')));
    } catch (error) {
        const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);

        return {
            ok: false,
            reason: `@koobiq/icons@${pkg.version}: ${reader.indexPath} did not match any known schema (${detail})`,
            hint: `This server knows ${KNOWN_RANGE}. Names must be taken from ${DOCS_HINT}`
        };
    }

    return {
        ok: true,
        version: pkg.version,
        readerMajor: exact ? pkg.major : fallback!.readerMajor,
        degraded: fallback?.note,
        data
    };
};
