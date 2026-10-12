import { parts } from '../semver.js';
import type { Guide, GuideSection } from '../types.js';

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

/**
 * Headings above a section, outermost first.
 *
 * Sections are stored flat and carry only their depth, so the parent of one is the nearest
 * preceding section shallower than it.
 */
const ancestorsOf = (guide: Guide, index: number): string[] => {
    const chain: string[] = [];
    let depth = guide.sections[index]?.depth ?? 2;

    for (let above = index - 1; above >= 0 && depth > 2; above--) {
        const candidate = guide.sections[above];

        if (candidate && candidate.depth < depth) {
            chain.unshift(candidate.heading);
            depth = candidate.depth;
        }
    }

    return chain;
};

/**
 * How a section has to be addressed for the address to name one section.
 *
 * `Running the migration` occurs four times in the migration guide, once under each release it
 * applies to, so on its own it is not an address — and answering it with the first match left the
 * subsections of releases 5 and 6 unreachable by any argument at all. Where a heading is unique it
 * is the whole path; where it is not, the heading above it is prefixed.
 */
export const sectionPath = (guide: Guide, index: number): string => {
    const section = guide.sections[index];

    if (!section) return '';
    if (guide.sections.filter((other) => other.heading === section.heading).length === 1) return section.heading;

    const parent = ancestorsOf(guide, index).at(-1);

    return parent ? `${parent} > ${section.heading}` : section.heading;
};

export type SectionHit =
    | { kind: 'found'; section: GuideSection; path: string; viaLang?: 'en' | 'ru' }
    | { kind: 'ambiguous'; paths: string[] }
    | { kind: 'missing' };

const matches = (heading: string, query: string): boolean => {
    const lowered = heading.toLowerCase();
    const wanted = query.toLowerCase();

    return lowered === wanted || lowered.includes(wanted);
};

/**
 * Every section whose address satisfies the query, exact heading matches in preference to partial.
 *
 * The query may be a path: `5. Filter-bar upgrade (20.2.0) > Running the migration`. The segments
 * before the last have to appear in the ancestor chain, in order but not necessarily adjacently,
 * so a reader does not have to know the depth of the heading they are quoting.
 */
const locate = (guide: Guide, query: string): number[] => {
    const segments = query
        .split(/\s*>\s*/)
        .map((segment) => segment.trim())
        .filter(Boolean);

    const target = segments.at(-1) ?? '';
    const above = segments.slice(0, -1);
    const exact: number[] = [];
    const partial: number[] = [];

    guide.sections.forEach((section, index) => {
        if (!matches(section.heading, target)) return;

        const chain = ancestorsOf(guide, index);
        let cursor = 0;

        for (const ancestor of above) {
            const at = chain.findIndex((heading, position) => position >= cursor && matches(heading, ancestor));

            if (at === -1) return;

            cursor = at + 1;
        }

        (section.heading.toLowerCase() === target.toLowerCase() ? exact : partial).push(index);
    });

    return exact.length > 0 ? exact : partial;
};

/**
 * Resolves a section address, across languages when it does not resolve in this one.
 *
 * Headings are translated along with the text, so an address taken from `migrate` or from an
 * English listing matches nothing in the Russian guide — four of the thirty-six calls in the first
 * recorded session were spent discovering that one at a time. Both languages are the same document
 * section for section, which is asserted in the tests, so a unique hit in the other language names
 * the section here by position.
 */
export const findSection = (guides: Guide[], guide: Guide, query: string): SectionHit => {
    const here = locate(guide, query);
    const found = (index: number, viaLang?: 'en' | 'ru'): SectionHit => {
        const section = guide.sections[index];

        return section
            ? { kind: 'found', section, path: sectionPath(guide, index), ...(viaLang ? { viaLang } : {}) }
            : { kind: 'missing' };
    };

    if (here.length === 1) return found(here[0]!);
    if (here.length > 1) return { kind: 'ambiguous', paths: here.map((index) => sectionPath(guide, index)) };

    const other = guides.find((candidate) => candidate.id === guide.id && candidate.lang !== guide.lang);

    // Position only means something while the two texts have the same sections. They do today, and
    // a test says so; if one language gains a heading, answering from the other would hand back a
    // neighbouring section while looking exactly like a correct answer.
    if (!other || other.sections.length !== guide.sections.length) return { kind: 'missing' };

    const there = locate(other, query);

    return there.length === 1 ? found(there[0]!, other.lang) : { kind: 'missing' };
};
