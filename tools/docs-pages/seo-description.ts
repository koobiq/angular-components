import type { Nodes, Paragraph } from 'mdast';
import { parsePage } from './compile-page';

// The description is also used for `twitter:description`, which supports up to 200 characters.
// Keep the ellipsis within that limit.
const MAX_DESCRIPTION_LENGTH = 200;

/** Text of inline content as the reader sees it: an HTML element separates words, an MDX comment is dropped. */
const getInlineText = (node: Nodes): string => {
    switch (node.type) {
        case 'text':
        case 'inlineCode':
            return node.value;
        case 'image':
            return node.alt ?? '';
        case 'break':
            return ' ';
        case 'mdxTextExpression':
            return '';
        case 'mdxJsxTextElement':
            return ` ${node.children.map(getInlineText).join('')} `;
        default:
            return 'children' in node ? node.children.map(getInlineText).join('') : '';
    }
};

const truncateDescription = (description: string): string => {
    if (description.length <= MAX_DESCRIPTION_LENGTH) return description;

    const truncated = description.slice(0, MAX_DESCRIPTION_LENGTH - 1);
    const lastSpace = truncated.lastIndexOf(' ');

    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : undefined)}…`;
};

/**
 * Returns the first paragraph of the introduction of an MDX page as plain text suitable for a meta description.
 * The page is read with the parser of the page compiler, so the description is the text the page shows.
 */
export const extractSeoDescription = (source: string, path = ''): string | null => {
    const { children } = parsePage(source, path);
    const firstSectionIndex = children.findIndex((node) => node.type === 'heading' && node.depth >= 3);
    const introduction = firstSectionIndex === -1 ? children : children.slice(0, firstSectionIndex);
    const paragraph = introduction.find((node): node is Paragraph => node.type === 'paragraph');

    if (!paragraph) return null;

    const description = getInlineText(paragraph).replace(/\s+/g, ' ').trim();

    return description ? truncateDescription(description) : null;
};
