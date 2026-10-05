import type { Guide, GuideSection } from '../types.js';

/**
 * Reading `which-component-when` — the task-to-component mapping.
 *
 * Stored as an ordinary guide so there is one copy of it, in the repository that owns the
 * components it describes. Nothing in the guide pipeline knows about it; the structure below is
 * recovered here, at read time, from the Markdown that is already stored.
 *
 * The unit that matters is the table *row*, not the section. A row says what to use, what not to
 * use, and why not — and "why not" is the part an agent cannot reconstruct from component names.
 * Returning a whole cluster instead would bury one answer in fifteen.
 */

export type Choice = {
    /** The job to be done, as the guide phrases it. */
    task: string;
    /** Component or combination to reach for. */
    use: string;
    /** The neighbour that gets picked by mistake. */
    instead?: string;
    /** Why that neighbour is wrong here. */
    why?: string;
    /** Heading of the cluster the row came from, for reading the rest. */
    cluster: string;
};

export type KeywordRoute = { words: string[]; cluster: string };

export type ComponentNote = { component: string; when: string; cluster: string };

/**
 * The three parts, recognised by shape rather than by title.
 *
 * Matching the English headings was enough until the guide had a Russian text, and then every
 * Russian question returned nothing — `## Разграничение` is not `## Disambiguation`, and the
 * failure was silent. Listing both titles would work until the next language or the next retitle;
 * what each part *is* does not change: one holds tables, one holds `- \`name\` — …` lines, one
 * holds `- words → cluster` lines.
 */
const IS_TABLE = /^\s*\|.*\|\s*$/m;
const IS_NAMED_BULLET = /^[-*]\s+`[^`]+`\s*[—–-]\s/m;
// A route bullet opens with ordinary words. The component index also uses `→`, in every second
// line — `- \`tag\` — one token inside an input control. → \`badge\` for a standalone label.` — so
// without excluding a leading backticked name it wins this test nine sections to one, and the
// keyword routing then runs on component descriptions.
const IS_ROUTE_BULLET = /^[-*]\s+(?!`)[^\n]*→/m;

/** Cells of a Markdown table row, or null for a separator or a non-row. */
const cells = (line: string): string[] | null => {
    const trimmed = line.trim();

    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;

    const parts = trimmed
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());

    return parts.every((cell) => /^:?-{2,}:?$/.test(cell)) ? null : parts;
};

const unquote = (cell: string): string => cell.replace(/`/g, '').trim();

/**
 * The `##` part whose own sections look like `shape`, with its subsections.
 *
 * A part runs from its heading to the next heading at the same level; the heading's own body is
 * included, because the keyword index has no subsections at all and its entries sit directly
 * beneath it.
 */
const partOf = (guide: Guide, shape: RegExp): GuideSection[] => {
    const parts: GuideSection[][] = [];

    for (const [index, section] of guide.sections.entries()) {
        if (section.depth !== 2) continue;

        const rest = guide.sections.slice(index + 1);
        const end = rest.findIndex((next) => next.depth <= 2);

        parts.push([section, ...(end === -1 ? rest : rest.slice(0, end))]);
    }

    // The part with the most matching sections wins: the provenance table at the top of the guide
    // is also a table, and it is one section against nine.
    return (
        parts
            .map((part) => ({ part, score: part.filter((section) => shape.test(section.body)).length }))
            .filter((entry) => entry.score > 0)
            .sort((a, b) => b.score - a.score)[0]?.part ?? []
    );
};

export const parseChoices = (guide: Guide | null): Choice[] => {
    if (!guide) return [];

    const choices: Choice[] = [];

    for (const section of partOf(guide, IS_TABLE)) {
        let header = true;

        for (const line of section.body.split('\n')) {
            const row = cells(line);

            if (!row) continue;

            // The first row of a table names the columns; it is not a choice.
            if (header) {
                header = false;
                continue;
            }

            const [task, use, instead, why] = row;

            if (!task || !use) continue;

            choices.push({
                task,
                use: unquote(use),
                ...(instead ? { instead: unquote(instead) } : {}),
                ...(why ? { why } : {}),
                cluster: section.heading
            });
        }
    }

    return choices;
};

/** `- multiselect, chips, 500 options → Pick a value from a set` */
export const parseKeywords = (guide: Guide | null): KeywordRoute[] => {
    if (!guide) return [];

    return partOf(guide, IS_ROUTE_BULLET).flatMap((section) =>
        section.body
            .split('\n')
            .map((line) => /^[-*]\s+(?!`)(.+?)\s*→\s*(.+?)\s*$/.exec(line.trim()))
            .flatMap((match) =>
                match
                    ? [
                          {
                              words: match[1]!
                                  .split(',')
                                  .map((word) => unquote(word))
                                  .filter(Boolean),
                              cluster: match[2]!
                          }
                      ]
                    : []
            )
    );
};

/** `- \`select\` — one or more values from a list the application owns; … → \`autocomplete\` when …` */
export const parseComponentNotes = (guide: Guide | null): ComponentNote[] => {
    if (!guide) return [];

    return partOf(guide, IS_NAMED_BULLET).flatMap((section) =>
        section.body
            .split('\n')
            .map((line) => /^[-*]\s+`([^`]+)`\s*[—–-]\s*(.+?)\s*$/.exec(line.trim()))
            .flatMap((match) => (match ? [{ component: match[1]!, when: match[2]!, cluster: section.heading }] : []))
    );
};
