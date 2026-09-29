import type { Code, Link, Nodes, Paragraph, PhrasingContent, Root, RootContent } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { parsePage } from '../docs-pages/compile-page';

/** A file of a live example, named the way the example's own code refers to it. */
export interface LlmsExampleFile {
    name: string;
    content: string;
}

/** A live example with every file an agent needs to reproduce it. */
export interface LlmsExample {
    id: string;
    title: string;
    files: LlmsExampleFile[];
}

export interface PageToMarkdownOptions {
    /** Path of the page, for error messages. */
    path: string;
    /** Depth the top-level headings of the page get; deeper headings keep their distance from them. */
    headingDepth: number;
    /** Returns the example an `<Example id>` tag refers to; throws for an unknown id. */
    resolveExample: (id: string) => LlmsExample;
    /** Where a link of the page leads when read outside the site: a site-relative link needs an origin. */
    resolveUrl: (url: string) => string;
}

const PHRASING_TYPES = new Set([
    'break',
    'delete',
    'emphasis',
    'footnoteReference',
    'inlineCode',
    'link',
    'linkReference',
    'strong',
    'text'
]);

/** Parents whose children are blocks; every other parent holds phrasing content, list items or table rows. */
const FLOW_PARENTS = new Set(['root', 'blockquote', 'listItem', 'footnoteDefinition']);

const stringifier = unified()
    .use(remarkGfm)
    .use(remarkStringify, { bullet: '-', fences: true, listItemIndent: 'one', rule: '-', emphasis: '_' });

const getAttribute = (node: MdxJsxFlowElement | MdxJsxTextElement, name: string): string | undefined => {
    const attribute = node.attributes.find(
        (candidate): candidate is MdxJsxAttribute => candidate.type === 'mdxJsxAttribute' && candidate.name === name
    );

    return typeof attribute?.value === 'string' ? attribute.value : undefined;
};

/** The example as a caption followed by one fenced block per file, the file name in the info string. */
const exampleToNodes = ({ id, title, files }: LlmsExample): RootContent[] => [
    {
        type: 'paragraph',
        children: [
            { type: 'strong', children: [{ type: 'text', value: `Example: ${title}` }] },
            { type: 'text', value: ' (' },
            { type: 'inlineCode', value: id },
            { type: 'text', value: ')' }
        ]
    },
    ...files.map(({ name, content }): Code => ({
        type: 'code',
        lang: name.split('.').pop() ?? null,
        meta: name,
        value: content.trimEnd()
    }))
];

/** Consecutive phrasing nodes left at block level by an unwrapped HTML element become one paragraph. */
const wrapPhrasing = (nodes: Nodes[]): Nodes[] => {
    const result: Nodes[] = [];
    let paragraph: Paragraph | null = null;

    for (const node of nodes) {
        if (PHRASING_TYPES.has(node.type)) {
            if (!paragraph) {
                paragraph = { type: 'paragraph', children: [] };
                result.push(paragraph);
            }

            paragraph.children.push(node as PhrasingContent);
        } else {
            paragraph = null;
            result.push(node);
        }
    }

    return result;
};

/**
 * Walks a parsed page: live examples become their source code, MDX comments and images disappear, the few HTML
 * elements a page may use become Markdown or their content, and links leave the site's relative form.
 */
const createTransformer = ({ path, resolveExample, resolveUrl }: Omit<PageToMarkdownOptions, 'headingDepth'>) => {
    const transformChildren = (children: Nodes[], flow: boolean): Nodes[] => {
        const result = children.flatMap(transformNode);

        return flow ? wrapPhrasing(result) : result;
    };

    const phrasing = (node: MdxJsxFlowElement | MdxJsxTextElement): PhrasingContent[] =>
        transformChildren(node.children as Nodes[], false) as PhrasingContent[];

    // A link around nothing but an image, such as a badge, would lose all its text with the image: its address stays.
    const link = (url: string, children: PhrasingContent[]): Link => ({
        type: 'link',
        url,
        children: children.length ? children : [{ type: 'text', value: url }]
    });

    const transformJsx = (node: MdxJsxFlowElement | MdxJsxTextElement): Nodes[] => {
        const flow = node.type === 'mdxJsxFlowElement';

        switch (node.name) {
            case 'Example': {
                const id = getAttribute(node, 'id');

                if (!id) throw new Error(`${path}: <Example> without an id`);

                const example = resolveExample(id);

                return flow ? exampleToNodes(example) : [{ type: 'text', value: `(example: ${example.title})` }];
            }

            case 'br':
                return flow ? [] : [{ type: 'break' }];

            case 'img':
                return [];

            case 'a':
                return [link(resolveUrl(getAttribute(node, 'href') ?? ''), phrasing(node))];

            case 'code':
            case 'kbd':
                return [{ type: 'inlineCode', value: toString(node) }];

            case 'strong':
                return [{ type: 'strong', children: phrasing(node) }];

            case 'em':
                return [{ type: 'emphasis', children: phrasing(node) }];

            // div, p, span, details, summary and the HTML lists keep only their content.
            default:
                return transformChildren(node.children as Nodes[], flow);
        }
    };

    const transformNode = (node: Nodes): Nodes[] => {
        switch (node.type) {
            case 'mdxjsEsm':
            case 'mdxFlowExpression':
            case 'mdxTextExpression':
            case 'image':
            case 'imageReference':
                return [];

            case 'mdxJsxFlowElement':
            case 'mdxJsxTextElement':
                return transformJsx(node);

            case 'link':
                return [
                    {
                        ...link(resolveUrl(node.url), transformChildren(node.children, false) as PhrasingContent[]),
                        title: node.title
                    }
                ];

            case 'definition':
                return [{ ...node, url: resolveUrl(node.url) }];

            default:
                if ('children' in node) {
                    (node as { children: Nodes[] }).children = transformChildren(
                        node.children as Nodes[],
                        FLOW_PARENTS.has(node.type)
                    );
                }

                return [node];
        }
    };

    return (root: Root): Root => ({ ...root, children: transformChildren(root.children, true) as RootContent[] });
};

/** Moves every heading so that the shallowest one of the page lands on `depth`, keeping the distances between them. */
const setHeadingDepth = (root: Root, depth: number): void => {
    const headings: { depth: number }[] = [];
    const collect = (node: Nodes): void => {
        if (node.type === 'heading') headings.push(node);

        if ('children' in node) node.children.forEach(collect);
    };

    collect(root);

    const shift = depth - Math.min(...headings.map((heading) => heading.depth));

    for (const heading of headings) heading.depth = Math.min(6, Math.max(1, heading.depth + shift)) as 1;
};

const stringify = (root: Root): string => String(stringifier.stringify(root)).trim();

/** Turns an MDX page of the documentation site into plain Markdown an agent can read without the site. */
export const pageToMarkdown = (source: string, options: PageToMarkdownOptions): string => {
    const root = createTransformer(options)(parsePage(source, options.path));

    setHeadingDepth(root, options.headingDepth);

    return stringify(root);
};

/**
 * The first sentence of a paragraph, cut at the first full stop that ends a sentence: one the next sentence starts
 * after, with anything but a lowercase letter, so that `e.g.` does not end it.
 */
const firstSentence = (paragraph: Paragraph): Paragraph => {
    const children: PhrasingContent[] = [];

    for (const node of paragraph.children) {
        const end = node.type === 'text' ? /[.!?](?=\s+\P{Ll}|$)/u.exec(node.value) : null;

        if (node.type === 'text' && end) {
            children.push({ ...node, value: node.value.slice(0, end.index + 1) });

            return { ...paragraph, children };
        }

        children.push(node);
    }

    return { ...paragraph, children };
};

/**
 * The first sentence of the introduction of a page — its first paragraph ahead of the first section, found the way
 * the SEO description finds it — as one line of Markdown, for an index of the pages. `null` when there is none.
 */
export const pageSummary = (source: string, options: Omit<PageToMarkdownOptions, 'headingDepth'>): string | null => {
    const { children } = parsePage(source, options.path);
    const firstSection = children.findIndex((node) => node.type === 'heading' && node.depth >= 3);
    const introduction = firstSection === -1 ? children : children.slice(0, firstSection);
    const paragraph = introduction.find((node): node is Paragraph => node.type === 'paragraph');

    if (!paragraph) return null;

    const [converted] = createTransformer(options)({ type: 'root', children: [paragraph] }).children;
    const summary =
        converted?.type === 'paragraph' ? stringify({ type: 'root', children: [firstSentence(converted)] }) : '';

    return summary.replace(/\s*\n\s*/g, ' ') || null;
};
