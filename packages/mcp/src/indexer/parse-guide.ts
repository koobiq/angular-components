import type { GuideSection } from '../types.js';

/**
 * Splits a guide's MDX into flat sections.
 *
 * Flat rather than nested: `theming` has only `###` headings while `migration` opens with a single
 * `##` and then uses `###` for each release, so a tree built from heading depth would be shaped
 * differently per file for no gain. A caller asks for a heading by name, and nesting would only
 * make that ambiguous.
 */

const HEADING = /^(#{2,4})\s+(.+?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;

/**
 * Both spellings of an example reference.
 *
 * The docs site moved from an HTML comment to a JSX element somewhere around 20.3 — `validation`
 * at 20.0.0 writes `<!-- example(validation-on-open) -->` and the same guide today writes
 * `<Example id="validation-on-open" />`. Reading only the current spelling loses every example
 * link in every older revision, which is precisely the set this index exists to keep.
 */
const EXAMPLE = /<Example\s+id="([^"]+)"|<!--\s*example\(([^)]+)\)\s*-->/g;

/** The JSX form is stripped as JSX later, so both are normalised to the comment form first. */
const markExamples = (text: string): string => text.replace(/<Example\s+id="([^"]+)"\s*\/?>/g, '<!-- example($1) -->');

/** MDX preamble and JSX that carries no prose. `<Example>` is pulled out before this runs. */
const NOISE = [
    /^import\s.+?;?\s*$/gm,
    /^export\s+(?:const|default)\s.+$/gm,
    /<\/?[A-Z][\w.]*(?:\s[^>]*?)?\/?>/g
];

const clean = (text: string): string =>
    NOISE.reduce((body, pattern) => body.replace(pattern, ''), text)
        .replace(/\n{3,}/g, '\n\n')
        .trim();

const examplesIn = (text: string): string[] => [
    ...new Set(
        [...text.matchAll(EXAMPLE)].flatMap((match) => {
            const id = (match[1] ?? match[2])?.trim();

            return id ? [id] : [];
        })
    )
];

export type ParsedGuide = {
    lede: string;
    sections: GuideSection[];
};

export const parseGuide = (source: string): ParsedGuide => {
    const lines = markExamples(source.replace(/\r\n/g, '\n')).split('\n');
    const sections: GuideSection[] = [];

    let fenced = false;
    let heading: string | null = null;
    let depth = 2;
    let buffer: string[] = [];
    let lede: string[] = [];

    const flush = (): void => {
        const body = buffer.join('\n');

        buffer = [];

        if (heading === null) {
            lede = [body];

            return;
        }

        sections.push({ heading, depth, body: clean(body), examples: examplesIn(body) });
    };

    for (const line of lines) {
        // A `#` inside a fenced block is shell or CSS, not a heading. Tracked rather than stripped
        // because the fences themselves belong in the body.
        if (FENCE.test(line)) fenced = !fenced;

        const match = fenced ? null : HEADING.exec(line);

        if (match?.[2]) {
            flush();
            heading = match[2];
            depth = match[1]!.length;
        } else {
            buffer.push(line);
        }
    }

    flush();

    return {
        lede: clean(lede.join('\n')),
        sections: sections.filter((section) => section.heading.length > 0)
    };
};

/** `search-smart` → `Search smart`, `angular-20-breaking-changes` → `Angular 20 breaking changes`. */
export const titleFromId = (id: string): string => {
    const words = id.replace(/-/g, ' ');

    return words.charAt(0).toUpperCase() + words.slice(1);
};
