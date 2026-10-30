import { headingLevels, shiftHeadings, slugify, splitByHeading } from './markdown-text';
import { getSiteUrl } from './sources';

/** Claude Code's WebFetch reads 100,000 characters of a file: the documentation for agents keeps a file under it. */
export const MAX_FILE_LENGTH = 100_000;

export const markdownLink = (title: string, url: string): string => `[${title}](${url})`;

/** Adds a file the site serves; a path written twice would leave one of the two files unreachable. */
export const addFile = (files: Map<string, string>, path: string, text: string): void => {
    if (files.has(path)) throw new Error(`${path} is written twice`);

    files.set(path, text);
};

/** A file whose sections may move to files of their own. */
export interface SectionParent {
    /** Its path without `.md`, which its sections go under: `en/main/migration`. */
    path: string;
    /** How a section names it: `[Upgrade guide](…)`, followed by the files above it. */
    link: string;
}

/**
 * Moves the sections of a text too long for one file into files of their own, at the first level of its headings
 * where it has more than one, and a section still too long the same way. The text keeps what comes ahead of them and
 * a link to each, in order; a section names the file it comes from and the files above that.
 */
export const splitSections = (text: string, parent: SectionParent, files: Map<string, string>): string => {
    if (text.length <= MAX_FILE_LENGTH) return text;

    const levels = headingLevels(text);
    const level = [...new Set(levels)]
        .sort((a, b) => a - b)
        .find((candidate) => levels.filter((other) => other === candidate).length > 1);

    // Nothing to split at: `check-llms` reports the length.
    if (!level) return text;

    const { preamble, sections } = splitByHeading(text, level);
    const links = sections.map(({ title, body }) => {
        const slug = slugify(title);
        const path = `${parent.path}/${slug}.md`;

        if (!slug || files.has(path)) throw new Error(`${parent.path}: the section "${title}" has no path of its own`);

        const sectionLink = markdownLink(title, getSiteUrl(path));
        const section = [`# ${title}`, `A section of ${parent.link}.`, shiftHeadings(body, 1 - level)].join('\n\n');

        addFile(
            files,
            path,
            splitSections(section, { path: `${parent.path}/${slug}`, link: `${sectionLink} in ${parent.link}` }, files)
        );

        return `- ${sectionLink}`;
    });

    return [preamble, links.join('\n')].filter(Boolean).join('\n\n');
};
