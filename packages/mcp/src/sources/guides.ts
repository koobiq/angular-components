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

/** English unless another language is asked for; falls back to what exists rather than answering nothing. */
export const pickGuide = (guides: Guide[], id: string, lang: 'en' | 'ru' = 'en'): Guide | null => {
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
    | { kind: 'found'; section: GuideSection; path: string }
    | { kind: 'ambiguous'; paths: string[] }
    | { kind: 'missing' };

const matches = (heading: string, query: string): boolean => {
    const lowered = heading.toLowerCase();
    const wanted = query.toLowerCase();

    return lowered === wanted || lowered.includes(wanted);
};

/** A query long enough that matching it against prose, not just a heading, means something. */
const MIN_BODY_QUERY_LENGTH = 4;

/**
 * Every section whose address satisfies the query, exact heading matches in preference to partial,
 * and a body match only once neither kind of heading match exists at all.
 *
 * The body tier exists because a heading is a label, not an index: "theming setup" is called
 * `Setup`, but what a reader actually asks for — "the prebuilt theme", "css-tokens" — is prose
 * inside it. Heading-only addressing answered that with "no section", the same dead end `llms.txt`
 * was pulled in to fix. The query may also be a path: `5. Filter-bar upgrade (20.2.0) > Running the
 * migration`. The segments before the last have to appear in the ancestor chain, in order but not
 * necessarily adjacently, so a reader does not have to know the depth of the heading they are
 * quoting.
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
    const body: number[] = [];
    const wanted = target.toLowerCase();
    const bySecond = wanted.length >= MIN_BODY_QUERY_LENGTH;

    guide.sections.forEach((section, index) => {
        const onHeading = matches(section.heading, target);
        const onBody = !onHeading && bySecond && section.body.toLowerCase().includes(wanted);

        if (!onHeading && !onBody) return;

        const chain = ancestorsOf(guide, index);
        let cursor = 0;

        for (const ancestor of above) {
            const at = chain.findIndex((heading, position) => position >= cursor && matches(heading, ancestor));

            if (at === -1) return;

            cursor = at + 1;
        }

        if (!onHeading) body.push(index);
        else (section.heading.toLowerCase() === wanted ? exact : partial).push(index);
    });

    if (exact.length > 0) return exact;
    if (partial.length > 0) return partial;

    return body;
};

/** Resolves a section address within one guide. */
export const findSection = (guide: Guide, query: string): SectionHit => {
    const here = locate(guide, query);

    if (here.length === 1) {
        const section = guide.sections[here[0]!];

        return section ? { kind: 'found', section, path: sectionPath(guide, here[0]!) } : { kind: 'missing' };
    }

    if (here.length > 1) return { kind: 'ambiguous', paths: here.map((index) => sectionPath(guide, index)) };

    return { kind: 'missing' };
};
