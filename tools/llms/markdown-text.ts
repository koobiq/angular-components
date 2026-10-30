import type { Nodes, Root, Table } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const parser = unified().use(remarkParse).use(remarkGfm);

export const parseMarkdown = (text: string): Root => parser.parse(text) as Root;

/** The text a node was parsed from, as written. */
export const sourceOf = (node: Nodes, text: string): string =>
    text.slice(node.position!.start.offset, node.position!.end.offset);

/**
 * The cells of a table, the header row first, each as the Markdown it is written in. The parser counts the pipe
 * that opens a row into its first cell and the one that closes it into the last.
 */
export const tableCells = (table: Table, text: string): string[][] =>
    table.children.map((row) =>
        row.children.map((cell) =>
            sourceOf(cell, text)
                .replace(/^\s*\|/, '')
                .replace(/(?<!\\)\|\s*$/, '')
                .trim()
        )
    );

/** A table without the padding that aligns its columns: an agent pays for every space of it. */
export const renderTable = ([header, ...rows]: string[][]): string =>
    [header, header.map(() => '-'), ...rows].map((cells) => `| ${cells.join(' | ')} |`).join('\n');

/** The text with every table in it written without padding; the rest stays as written. */
export const compactTables = (text: string): string => {
    const tables = parseMarkdown(text).children.filter((node): node is Table => node.type === 'table');

    return tables.reduceRight(
        (result, table) =>
            result.slice(0, table.position!.start.offset) +
            renderTable(tableCells(table, text)) +
            result.slice(table.position!.end.offset),
        text
    );
};

/** A title as a file name: lowercase ASCII words joined by hyphens, `Choosing a value from a set` → `choosing-a-value-from-a-set`. */
export const slugify = (title: string): string =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const FENCE = /^\s*(`{3,}|~{3,})/;

const HEADING = /^(#{1,6}) /;

/** Calls `visit` for every line with whether it is outside the blocks of code, where a `#` starts a heading. */
const forEachLine = (text: string, visit: (line: string, outsideCode: boolean) => void): void => {
    let openFence: string | null = null;

    for (const line of text.split('\n')) {
        const fence = FENCE.exec(line)?.[1];

        if (fence && !openFence) {
            openFence = fence;
            visit(line, false);
        } else if (fence && fence[0] === openFence![0] && fence.length >= openFence!.length) {
            openFence = null;
            visit(line, false);
        } else {
            visit(line, !openFence);
        }
    }
};

/** The level of every heading outside the blocks of code, in order. */
export const headingLevels = (text: string): number[] => {
    const levels: number[] = [];

    forEachLine(text, (line, outsideCode) => {
        const heading = outsideCode && HEADING.exec(line);

        if (heading) levels.push(heading[1].length);
    });

    return levels;
};

/**
 * Splits Markdown at its headings of the given level, leaving the headings inside blocks of code alone: the text
 * ahead of the first heading, then every section with its title and its body.
 */
export const splitByHeading = (
    text: string,
    level: number
): { preamble: string; sections: { title: string; body: string }[] } => {
    const marker = `${'#'.repeat(level)} `;
    const sections: { title: string; lines: string[] }[] = [];
    const preamble: string[] = [];

    forEachLine(text, (line, outsideCode) => {
        if (outsideCode && line.startsWith(marker)) {
            sections.push({ title: line.slice(marker.length).trim(), lines: [] });
        } else {
            (sections.at(-1)?.lines ?? preamble).push(line);
        }
    });

    return {
        preamble: preamble.join('\n').trim(),
        sections: sections.map(({ title, lines }) => ({ title, body: lines.join('\n').trim() }))
    };
};

/** Moves every heading outside the blocks of code by `shift` levels, keeping it between 1 and 6. */
export const shiftHeadings = (text: string, shift: number): string => {
    const lines: string[] = [];

    forEachLine(text, (line, outsideCode) =>
        lines.push(
            outsideCode
                ? line.replace(/^(#{1,6})(?= )/, (hashes) =>
                      '#'.repeat(Math.min(6, Math.max(1, hashes.length + shift)))
                  )
                : line
        )
    );

    return lines.join('\n');
};
