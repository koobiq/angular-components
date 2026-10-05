import { parts } from '../semver.js';
import type { Guide } from '../types.js';

/**
 * Serving a guide, and saying what it describes.
 *
 * Only the current text is bundled; see `types.ts` for the measurement behind that. What remains
 * here is the honesty: the text names the release it came from, and a project on a different major
 * is told so rather than left to assume the prose was written for it.
 */

export const guideCaveat = (guide: Guide, version: string | null): string | null => {
    if (guide.unreleased) {
        return `this guide is not in any release yet — it exists only in the components repository, and may change or ship differently`;
    }

    if (!version) return null;

    // Majors only. A minor behind is normal and saying so on every call would train the reader to
    // ignore the line that matters.
    const [guideMajor] = parts(guide.since);
    const [projectMajor] = parts(version);

    if (guideMajor === projectMajor) return null;

    return `this text is from ${guide.since} and this project is on ${version} — a different major, so parts of it may not apply`;
};

/** Prefers the asked-for language, falls back to the other rather than answering nothing. */
export const pickGuide = (guides: Guide[], id: string, lang: 'en' | 'ru'): Guide | null => {
    const matching = guides.filter((guide) => guide.id === id);

    return matching.find((guide) => guide.lang === lang) ?? matching[0] ?? null;
};

export const guideIds = (guides: Guide[]): string[] => [...new Set(guides.map((guide) => guide.id))].sort();

/** Exact heading first, then the first that contains the query. */
export const findSection = (guide: Guide, query: string): Guide['sections'][number] | null => {
    const wanted = query.toLowerCase();

    return (
        guide.sections.find((section) => section.heading.toLowerCase() === wanted) ??
        guide.sections.find((section) => section.heading.toLowerCase().includes(wanted)) ??
        null
    );
};
