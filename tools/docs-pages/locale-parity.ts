import type { Nodes, Paragraph, Root } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { collectLinks, getLinkLocale, type ParsedPage } from './page-links';

/** A block of a page, in the form both of its languages have to share. */
interface OutlineBlock {
    description: string;
    line: number;
}

const getAttribute = ({ attributes }: MdxJsxFlowElement | MdxJsxTextElement, name: string): unknown =>
    attributes.find((attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === name)?.value;

/** The images inside a paragraph, however deep: a paragraph can wrap one in a link or write it as an element. */
const getInlineImages = (node: Nodes): unknown[] => {
    if (node.type === 'image') return [node.url];
    if (node.type === 'mdxJsxTextElement' && node.name === 'img') return [getAttribute(node, 'src')];

    return 'children' in node ? node.children.flatMap(getInlineImages) : [];
};

const describeParagraph = (paragraph: Paragraph): string => {
    const images = getInlineImages(paragraph);

    return images.length ? `paragraph with image ${images.join(', ')}` : 'paragraph';
};

const describeElement = (element: MdxJsxFlowElement): string => {
    if (element.name === 'Example') return `example ${getAttribute(element, 'id')}`;

    const source = getAttribute(element, 'src');

    return source ? `<${element.name}> ${source}` : `<${element.name}>`;
};

/** The description of a block; `null` for what the reader never sees, such as an MDX comment. */
const describeBlock = (node: Nodes): string | null => {
    switch (node.type) {
        case 'heading':
            return `heading of level ${node.depth}`;
        case 'paragraph':
            return describeParagraph(node);
        case 'list':
            return `${node.ordered ? 'ordered' : 'bulleted'} list, items: ${node.children.length}`;
        case 'table':
            return `table, rows: ${node.children.length}, columns: ${node.children[0]?.children.length ?? 0}`;
        case 'code':
            return node.lang ? `${node.lang} code block` : 'code block';
        case 'blockquote':
            return 'blockquote';
        case 'thematicBreak':
            return 'horizontal rule';
        case 'mdxJsxFlowElement':
            return describeElement(node);
        default:
            return null;
    }
};

/** Blocks that hold other blocks: a nested list has to match as well as the list around it. */
const getNestedBlocks = (node: Nodes): Nodes[] => {
    switch (node.type) {
        case 'blockquote':
        case 'list':
        case 'listItem':
        case 'mdxJsxFlowElement':
            return node.children;
        default:
            return [];
    }
};

const collectBlocks = (nodes: Nodes[]): OutlineBlock[] =>
    nodes.flatMap((node) => {
        const description = describeBlock(node);
        const nested = collectBlocks(getNestedBlocks(node));

        return description ? [{ description, line: node.position?.start.line ?? 0 }, ...nested] : nested;
    });

/** The blocks of a page in reading order: what has to stay the same when the page is translated. */
const getPageOutline = (root: Root): OutlineBlock[] => collectBlocks(root.children);

/** Links of a page that lead a reader to the other language of the site. */
const findForeignLinks = (root: Root, path: string, otherLocale: string): string[] =>
    collectLinks(root)
        .filter(({ url }) => getLinkLocale(url) === otherLocale)
        .map(({ url, line }) => `${path}:${line}: links to the other language: ${url}`);

/** The first place where the outlines of two languages of a page part, or `null` when they are the same. */
const findOutlineDifference = (
    enPath: string,
    en: OutlineBlock[],
    ruPath: string,
    ru: OutlineBlock[]
): string | null => {
    const index = en.findIndex(({ description }, i) => description !== ru[i]?.description);
    const at = index === -1 && ru.length > en.length ? en.length : index;

    if (at === -1) return null;

    const describe = (path: string, block: OutlineBlock | undefined): string =>
        block ? `${path}:${block.line} has ${block.description}` : `${path} has no more blocks`;

    return `${describe(enPath, en[at])}, but ${describe(ruPath, ru[at])}`;
};

/**
 * Compares the English and the Russian version of a page. Both have to show the same structure, whatever the wording:
 * the headings, paragraphs, lists, tables, code blocks, examples and images in the same order. Only the first
 * difference of a page is reported, since the blocks after it are out of step.
 */
export const comparePageLocales = (en: ParsedPage, ru: ParsedPage): string[] => {
    const difference = findOutlineDifference(en.path, getPageOutline(en.root), ru.path, getPageOutline(ru.root));

    return [
        ...(difference ? [difference] : []),
        ...findForeignLinks(en.root, en.path, 'ru'),
        ...findForeignLinks(ru.root, ru.path, 'en')
    ];
};

const EN_PAGE = /\.en\.mdx$/;
const RU_PAGE = /\.ru\.mdx$/;

/** Checks every page against its other language. */
export const findLocaleProblems = (pages: ParsedPage[]): string[] => {
    const pagesByPath = new Map(pages.map((page) => [page.path, page]));
    const missing = pages.flatMap(({ path }) => {
        const counterpart = EN_PAGE.test(path) ? path.replace(EN_PAGE, '.ru.mdx') : path.replace(RU_PAGE, '.en.mdx');

        return pagesByPath.has(counterpart) ? [] : [`${path}: no ${counterpart} next to it`];
    });

    return [
        ...missing,
        ...pages
            .filter(({ path }) => EN_PAGE.test(path))
            .flatMap((en) => {
                const ru = pagesByPath.get(en.path.replace(EN_PAGE, '.ru.mdx'));

                return ru ? comparePageLocales(en, ru) : [];
            })
    ];
};
