import { marked, Token, Tokens } from 'marked';

const MAX_DESCRIPTION_LENGTH = 200;

const inlineTokenText = (token: Token): string => {
    if (token.type === 'br' || token.type === 'html') return ' ';

    return 'text' in token && typeof token.text === 'string' ? token.text : '';
};

const normalizeDescription = (description: string): string => {
    return description
        .replace(/&nbsp;|\u00a0/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#(?:39|x27);/gi, "'")
        .replace(/&amp;/g, '&')
        .replace(/[`*_~]/g, '')
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const truncateDescription = (description: string): string => {
    if (description.length <= MAX_DESCRIPTION_LENGTH) return description;

    const truncated = description.slice(0, MAX_DESCRIPTION_LENGTH - 1);
    const lastSpace = truncated.lastIndexOf(' ');

    return `${truncated.slice(0, lastSpace > 0 ? lastSpace : undefined)}…`;
};

/** Returns the first user-facing Markdown paragraph as plain text suitable for a meta description. */
export const extractSeoDescription = (markdown: string): string | null => {
    const paragraph = marked.lexer(markdown).find((token): token is Tokens.Paragraph => token.type === 'paragraph');

    if (!paragraph) return null;

    const description = normalizeDescription(paragraph.tokens.map(inlineTokenText).join(''));

    return description ? truncateDescription(description) : null;
};
