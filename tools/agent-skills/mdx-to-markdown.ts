import type { Code, Nodes, Paragraph, PhrasingContent, Root, RootContent } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { parsePage } from '../docs-pages/compile-page';

export interface ExampleFile {
    name: string;
    content: string;
}

/** A live example of the documentation site, with the source files its page shows. */
export interface ResolvedExample {
    id: string;
    title: string;
    files: ExampleFile[];
}

export interface PageToMarkdownOptions {
    /** Path of the page, for error messages. */
    path: string;
    /** Returns the example an `<Example id>` tag refers to; throws for an unknown id. */
    resolveExample: (id: string) => ResolvedExample;
    /** Origin that site-relative links such as `/en/main/theming/overview` point to. */
    siteUrl: string;
}

const PHRASING_TYPES = new Set([
    'break',
    'delete',
    'emphasis',
    'footnoteReference',
    'html',
    'image',
    'imageReference',
    'inlineCode',
    'link',
    'linkReference',
    'strong',
    'text'
]);

/** Parents whose children are blocks; every other parent holds phrasing content, lists or table rows. */
const FLOW_PARENTS = new Set(['root', 'blockquote', 'listItem', 'footnoteDefinition']);

const CODE_LANGUAGES: Record<string, string> = { ts: 'ts', html: 'html', css: 'css', scss: 'scss', json: 'json' };

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
export const exampleToNodes = (example: ResolvedExample): RootContent[] => [
    {
        type: 'paragraph',
        children: [
            { type: 'strong', children: [{ type: 'text', value: `Example: ${example.title}` }] },
            { type: 'text', value: ' (' },
            { type: 'inlineCode', value: example.id },
            { type: 'text', value: ')' }
        ]
    },
    ...example.files.map((file): Code => ({
        type: 'code',
        lang: CODE_LANGUAGES[file.name.split('.').pop() ?? ''] ?? null,
        meta: file.name,
        value: file.content.trimEnd()
    }))
];

/** Consecutive phrasing nodes left at block level by an unwrapped HTML element become one paragraph. */
const wrapPhrasing = (nodes: Nodes[]): Nodes[] => {
    const result: Nodes[] = [];
    let paragraph: Paragraph | null = null;

    for (const node of nodes) {
        if (PHRASING_TYPES.has(node.type)) {
            paragraph ??= { type: 'paragraph', children: [] };
            paragraph.children.push(node as PhrasingContent);

            if (!result.includes(paragraph)) result.push(paragraph);

            continue;
        }

        paragraph = null;
        result.push(node);
    }

    return result;
};

/**
 * Turns an MDX page of the documentation site into plain Markdown an agent can read: live examples become their
 * source code, MDX comments and images disappear, the few HTML elements pages may use become Markdown or their
 * content, and site-relative links become absolute.
 */
export const pageToMarkdown = (source: string, options: PageToMarkdownOptions): string => {
    const absolutize = (url: string): string =>
        url.startsWith('/') && !url.startsWith('//') ? `${options.siteUrl}${url}` : url;

    const transformChildren = (children: Nodes[], flow: boolean): Nodes[] => {
        const result = children.flatMap((child) => transformNode(child));

        return flow ? wrapPhrasing(result) : result;
    };

    const transformJsx = (node: MdxJsxFlowElement | MdxJsxTextElement): Nodes[] => {
        const flow = node.type === 'mdxJsxFlowElement';

        switch (node.name) {
            case 'Example': {
                const id = getAttribute(node, 'id');

                if (!id) throw new Error(`${options.path}: <Example> without an id`);

                const example = options.resolveExample(id);

                return flow
                    ? exampleToNodes(example)
                    : [{ type: 'text', value: `(see the "${example.title}" example)` }];
            }

            case 'br':
                return flow ? [] : [{ type: 'break' }];

            case 'img':
                return [];

            case 'a':
                return [
                    {
                        type: 'link',
                        url: absolutize(getAttribute(node, 'href') ?? ''),
                        children: transformChildren(node.children, false) as PhrasingContent[]
                    }
                ];

            case 'code':
            case 'kbd':
                return [{ type: 'inlineCode', value: toString(node) }];

            case 'strong':
                return [{ type: 'strong', children: transformChildren(node.children, false) as PhrasingContent[] }];

            case 'em':
                return [{ type: 'emphasis', children: transformChildren(node.children, false) as PhrasingContent[] }];

            // div, p, span, details, summary and the HTML lists keep only their content.
            default:
                return transformChildren(node.children, flow);
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
                        ...node,
                        url: absolutize(node.url),
                        children: transformChildren(node.children, false) as PhrasingContent[]
                    }
                ];

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

    const root = parsePage(source, options.path);

    root.children = transformChildren(root.children, true) as RootContent[];

    return String(stringifier.stringify(root as Root)).trim();
};
