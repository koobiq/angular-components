import type { Heading, ListItem, Nodes, Paragraph, Root, RootContent, TableRow } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { toString } from 'mdast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import {
    CLASS_PREFIX,
    MARKDOWN_TAGS_TO_CLASS_ALIAS,
    MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS
} from '../../packages/components/markdown/markdown.values';
import type { LiveExample } from '../../packages/docs-examples/example-module';
import { canRenderExampleOnServer } from '../../packages/docs-examples/server-rendering';

/** File of a `kbq-code-block`, as the compiled page binds it. */
export interface CompiledCodeBlock {
    content: string;
    language?: string;
}

/** An MDX page compiled into the parts of an Angular component. */
export interface CompiledPage {
    /** Angular template of the page. */
    template: string;
    /** Fenced code blocks: the template binds them by index, so code never becomes template text. */
    codeBlocks: CompiledCodeBlock[];
    /** Examples the page renders on the server as well, in the order they first appear. */
    examples: LiveExample[];
    /**
     * Examples that render only in the browser, in the order they first appear. The page loads them once it has
     * rendered, so neither the route nor hydration waits for their code.
     */
    browserExamples: LiveExample[];
}

export interface CompilePageOptions {
    /** Path of the source, used in error messages. */
    path: string;
    /** Catalogue that `<Example id>` is resolved against. */
    examples: Record<string, LiveExample>;
    /** URL of the page, which links to its own fragments resolve against; `null` when no route renders it. */
    url: string | null;
}

type JsxElement = MdxJsxFlowElement | MdxJsxTextElement;

interface RenderContext {
    /** Whether the node ends up inside `<p>`, where the browser would not keep a block element. */
    inParagraph: boolean;
    /** Whether the node ends up inside `<a>`, where the browser would not keep another link. */
    inLink: boolean;
}

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);

/** Parses the MDX of a page. A syntax error names the file and the position, as the errors of the compiler do. */
export const parsePage = (source: string, path: string): Root => {
    try {
        return parser.parse(source);
    } catch (error) {
        // MDX reports a syntax error as a VFileMessage, which knows the position but not the file.
        if (error instanceof Error && 'reason' in error && 'line' in error && 'column' in error) {
            throw new Error(`${path}:${error.line ?? 0}:${error.column ?? 0}: ${error.reason}`);
        }

        throw error;
    }
};

/**
 * HTML a page may use where Markdown has no syntax. Every other element fails the build: write it in Markdown.
 * `mdx-components.ts` types the same elements for the editor.
 */
export const HTML_ELEMENTS = [
    'a',
    'br',
    'code',
    'details',
    'div',
    'em',
    'img',
    'kbd',
    'li',
    'ol',
    'p',
    'span',
    'strong',
    'summary',
    'ul'
] as const;

const HTML_ELEMENT_NAMES: ReadonlySet<string> = new Set(HTML_ELEMENTS);

const VOID_ELEMENTS = new Set(['br', 'img']);

/** Elements the browser moves out of `<p>` while parsing, so the hydrated DOM would not match the prerendered one. */
const BLOCK_ELEMENTS = new Set(['details', 'div', 'li', 'ol', 'p', 'summary', 'ul']);

/** Markdown that renders as a block element, which the browser would move out of `<p>` as well. */
const BLOCK_NODES = new Set(['blockquote', 'code', 'heading', 'list', 'paragraph', 'table', 'thematicBreak']);

const LINK_CLASSES = 'docs-markdown__a kbq-link kbq-text-only kbq-link_use-visited';

/** Classes of the documentation typography for an element the page writes in HTML. */
const getElementClass = (tag: string): string | null => {
    if (!MARKDOWN_TAGS_TO_CLASS_ALIAS.includes(tag) && !MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS.includes(tag)) return null;

    return tag === 'a' ? `${CLASS_PREFIX}__a ${LINK_CLASSES}` : `${CLASS_PREFIX}__${tag}`;
};

/**
 * Escapes text for an Angular template, so `{{ value }}` and `@for` stay text. Markup and the characters
 * that open an ICU expression or a control flow block become character references; Angular decodes
 * those before it looks for interpolations, so an empty comment also splits every pair of braces.
 */
const escapeTemplateText = (text: string): string =>
    text.replace(/[&<>"{}@]/g, (char) => `&#${char.charCodeAt(0)};`).replace(/(&#123;|&#125;)(?=\1)/g, '$1<!---->');

/**
 * Text for the template. Angular drops a text node of whitespace alone, which would join the elements around
 * it (`` `a` _and_ `b` `` would read "aandb"); `&ngsp;` is the space it keeps.
 */
const renderText = (text: string): string => (/^\s+$/.test(text) ? '&ngsp;' : escapeTemplateText(text));

/** Text the reader sees in a node: MDX comments are for the tools and stay out of it. */
const getVisibleText = (node: Nodes): string => {
    if (node.type === 'mdxTextExpression' || node.type === 'mdxFlowExpression') return '';

    return 'children' in node ? node.children.map(getVisibleText).join('') : toString(node);
};

/**
 * The id of a heading, derived from its text, so links such as `#size` or `#размер` keep working.
 * Braces are dropped: an attribute has no room for the comment that keeps them from interpolating.
 */
const getHeadingId = (heading: Heading): string =>
    getVisibleText(heading).trim().toLowerCase().replace(/\s/g, '-').replace(/[{}]/g, '');

/** Heading levels that get an id and appear in the table of contents. */
const LINKED_HEADING_DEPTHS = [2, 3, 4, 5];

const isComment = (expression: string): boolean => /^\s*\/\*(?:[^*]|\*(?!\/))*\*\/\s*$/.test(expression);

/** Compiles the MDX source of a documentation page. Throws on anything the site cannot render yet. */
export function compilePage(source: string, { path, examples, url }: CompilePageOptions): CompiledPage {
    const page: CompiledPage = { template: '', codeBlocks: [], examples: [], browserExamples: [] };

    const lines = source.split('\n');

    // MDX wraps the lines inside an element into a paragraph. In Markdown, an HTML block runs until a blank line,
    // so only text after a blank line is a paragraph; anything else stays inline.
    const followsBlankLine = (node: Nodes): boolean => !lines[(node.position?.start.line ?? 1) - 2]?.trim();

    const fail = (node: Nodes, message: string): never => {
        const { line, column } = node.position?.start ?? { line: 0, column: 0 };

        throw new Error(`${path}:${line}:${column}: ${message}`);
    };

    const headingIds = new Set<string>();

    /**
     * The id of a heading, unique within the page: the anchors of the table of contents link by id, and
     * `getElementById` resolves the first of several equal ones. A repeated heading takes a numeric suffix.
     */
    const takeHeadingId = (heading: Heading): string => {
        const id = getHeadingId(heading);
        let unique = id;

        for (let suffix = 2; headingIds.has(unique); suffix++) {
            unique = `${id}-${suffix}`;
        }

        headingIds.add(unique);

        return unique;
    };

    const renderAll = (nodes: Nodes[], context: RenderContext): string =>
        nodes.map((node) => render(node, context)).join('');

    const renderChildren = (node: Nodes, context: RenderContext): string =>
        renderAll('children' in node ? node.children : [], context);

    const renderAttribute = (node: Nodes, name: string, value: string | null): string => {
        // Angular interpolates `{{ }}` in an attribute, and an attribute has no room for the comment that stops it.
        if (value !== null && /\{\{|\}\}/.test(value)) {
            return fail(node, `the ${name} attribute cannot contain "{{" or "}}"`);
        }

        return value === null ? ` ${name}` : ` ${name}="${escapeTemplateText(value)}"`;
    };

    // With a base href of `/`, a bare `#size` would lead to the start page.
    const resolveHref = (href: string): string => (href.startsWith('#') && url ? `${url}${href}` : href);

    const renderParagraph = (paragraph: Paragraph, parentContext: RenderContext): string => {
        const context = { ...parentContext, inParagraph: true };
        const parts: string[] = [];
        // What follows an image, up to the next one, is its caption; an image can also stand without one.
        let caption: RootContent[] | null = null;

        const endCaption = (): void => {
            const nodes = caption;

            caption = null;

            if (!nodes?.some((node) => getVisibleText(node).trim())) return;

            parts.push(`<em>${renderAll(nodes, context)}</em>`);
        };

        for (const child of paragraph.children) {
            if (child.type === 'image') {
                endCaption();
                parts.push(render(child, context));
                caption = [];
            } else if (caption) {
                caption.push(child);
            } else {
                parts.push(render(child, context));
            }
        }

        endCaption();

        return `<p class="${CLASS_PREFIX}__p">${parts.join('')}</p>`;
    };

    // A tight list renders the paragraphs of its items without `<p>`, as Markdown renderers do.
    const renderListItem = (item: ListItem, isTight: boolean, parentContext: RenderContext): string => {
        if (typeof item.checked === 'boolean') return fail(item, 'task lists are not supported yet');

        const context = { ...parentContext, inParagraph: false };
        const content = item.children.map((child) =>
            isTight && child.type === 'paragraph' ? renderChildren(child, context) : render(child, context)
        );

        return `<li class="${CLASS_PREFIX}__li">${content.join('')}</li>`;
    };

    const renderTableRow = (
        row: TableRow,
        tag: 'th' | 'td',
        align: (string | null | undefined)[],
        parentContext: RenderContext
    ): string => {
        const cells = row.children.map((cell, index) => {
            const alignment = align[index] ? ` align="${align[index]}"` : '';
            const content = renderChildren(cell, { ...parentContext, inParagraph: false });

            return `<${tag} class="${CLASS_PREFIX}__${tag}"${alignment}>${content}</${tag}>`;
        });

        return `<tr class="${CLASS_PREFIX}__tr">${cells.join('')}</tr>`;
    };

    const renderExample = (element: MdxJsxFlowElement): string => {
        if (element.children.length > 0) return fail(element, '<Example> does not take content');

        const [attribute, ...rest] = element.attributes;

        if (
            attribute?.type !== 'mdxJsxAttribute' ||
            attribute.name !== 'id' ||
            typeof attribute.value !== 'string' ||
            rest.length > 0
        ) {
            return fail(element, '<Example> takes a single string attribute: id');
        }

        const id = attribute.value;

        if (!Object.hasOwn(examples, id)) return fail(element, `there is no example "${id}" in packages/docs-examples`);

        const example = examples[id];
        const pageExamples = canRenderExampleOnServer(id, example) ? page.examples : page.browserExamples;

        if (!pageExamples.includes(example)) pageExamples.push(example);

        return `<docs-live-example-viewer example="${escapeTemplateText(id)}" [component]="examples.${example.componentName}" />`;
    };

    /** An HTML element written in the page, with the classes of the documentation typography. */
    const renderElement = (element: JsxElement, context: RenderContext): string => {
        const tag = element.name ?? '';

        if (!HTML_ELEMENT_NAMES.has(tag)) {
            return fail(element, `<${tag}> is not supported: use Markdown or one of ${HTML_ELEMENTS.join(', ')}`);
        }

        if (context.inParagraph && BLOCK_ELEMENTS.has(tag)) {
            return fail(element, `<${tag}> cannot be inside a paragraph: the browser would move it out of it`);
        }

        if (context.inLink && tag === 'a') {
            return fail(element, '<a> cannot be inside a link: the browser would move it out of it');
        }

        const attributes = new Map<string, string | null>();

        for (const attribute of element.attributes) {
            if (
                attribute.type !== 'mdxJsxAttribute' ||
                (attribute.value !== null && typeof attribute.value !== 'string')
            ) {
                return fail(element, `the attributes of <${tag}> must be plain strings`);
            }

            // Angular's canonical binding syntax is a plain attribute name: `on-click` would become an event
            // binding on the page component, and `bind-title` a property binding, instead of staying markup.
            if (/^(?:bind|on|let|ref)-/.test(attribute.name)) {
                return fail(element, `the ${attribute.name} attribute of <${tag}> would become an Angular binding`);
            }

            attributes.set(attribute.name, attribute.value);
        }

        const elementClass = [getElementClass(tag), attributes.get('class')].filter(Boolean).join(' ');
        // The class goes first, as on the elements the page writes in Markdown.
        const ordered = new Map<string, string | null>(elementClass ? [['class', elementClass]] : []);

        for (const [name, value] of attributes) {
            if (name === 'class') continue;

            ordered.set(name, tag === 'a' && name === 'href' && value ? resolveHref(value) : value);
        }

        const openingTag = `<${tag}${[...ordered].map(([name, value]) => renderAttribute(element, name, value)).join('')}>`;

        if (VOID_ELEMENTS.has(tag)) return openingTag;

        const childContext: RenderContext = {
            // The content of `<p>` is inside a paragraph, and the content of any other block element is not.
            inParagraph: tag === 'p' || (!BLOCK_ELEMENTS.has(tag) && context.inParagraph),
            inLink: tag === 'a' || context.inLink
        };
        const children: RootContent[] = element.children;
        const content = children.map((child) =>
            element.type === 'mdxJsxFlowElement' && child.type === 'paragraph' && !followsBlankLine(child)
                ? renderChildren(child, childContext)
                : render(child, childContext)
        );

        return `${openingTag}${content.join('')}</${tag}>`;
    };

    const render = (node: Nodes, context: RenderContext): string => {
        if (
            context.inParagraph &&
            (BLOCK_NODES.has(node.type) || (node.type === 'mdxJsxFlowElement' && node.name === 'Example'))
        ) {
            const name = node.type === 'mdxJsxFlowElement' ? '<Example>' : `"${node.type}"`;

            return fail(node, `${name} cannot be inside a paragraph: the browser would move it out of it`);
        }

        switch (node.type) {
            case 'root':
                // One block per line keeps the generated template readable; Angular drops the whitespace.
                return node.children.map((child) => render(child, context)).join('\n');
            case 'paragraph':
                return renderParagraph(node, context);
            case 'heading': {
                const tag = `h${node.depth}`;
                const id = LINKED_HEADING_DEPTHS.includes(node.depth)
                    ? ` id="${escapeTemplateText(takeHeadingId(node))}"`
                    : '';

                return `<${tag}${id} class="docs-header-link ${CLASS_PREFIX}__${tag}">${renderChildren(node, { ...context, inParagraph: true })}</${tag}>`;
            }
            case 'text':
                return renderText(node.value);
            case 'inlineCode':
                return `<code class="${CLASS_PREFIX}__code">${renderText(node.value)}</code>`;
            case 'strong':
                return `<strong>${renderChildren(node, context)}</strong>`;
            case 'emphasis':
                return `<em>${renderChildren(node, context)}</em>`;
            case 'break':
                return '<br>';
            case 'link': {
                // GFM turns a URL in the text into a link, which inside `<a>` would nest one link in another.
                if (context.inLink) return renderChildren(node, context);

                const title = node.title ? renderAttribute(node, 'title', node.title) : '';
                const href = renderAttribute(node, 'href', resolveHref(node.url));
                const content = renderChildren(node, { ...context, inLink: true });

                return `<a class="${getElementClass('a')}"${href}${title}>${content}</a>`;
            }
            case 'image': {
                const title = node.title ? renderAttribute(node, 'title', node.title) : '';
                const src = renderAttribute(node, 'src', node.url);

                return `<img class="${CLASS_PREFIX}__img"${src}${renderAttribute(node, 'alt', node.alt ?? '')}${title}>`;
            }
            case 'blockquote':
                return `<blockquote class="${CLASS_PREFIX}__blockquote">${renderChildren(node, { ...context, inParagraph: false })}</blockquote>`;
            case 'thematicBreak':
                return `<hr class="${CLASS_PREFIX}__hr">`;
            case 'list': {
                const tag = node.ordered ? 'ol' : 'ul';
                const start = node.ordered && node.start !== null && node.start !== 1 ? ` start="${node.start}"` : '';
                const isTight = !node.spread && node.children.every((item) => !item.spread);
                const items = node.children.map((item) => renderListItem(item, isTight, context));

                return `<${tag}${start} class="${CLASS_PREFIX}__${tag}">${items.join('')}</${tag}>`;
            }
            case 'table': {
                const [head, ...rows] = node.children;
                const align = node.align ?? [];
                const body = rows.length
                    ? `<tbody class="${CLASS_PREFIX}__tbody">${rows.map((row) => renderTableRow(row, 'td', align, context)).join('')}</tbody>`
                    : '';

                return `<table class="${CLASS_PREFIX}__table"><thead class="${CLASS_PREFIX}__thead">${renderTableRow(head, 'th', align, context)}</thead>${body}</table>`;
            }
            case 'code': {
                const codeBlock = node.lang ? { content: node.value, language: node.lang } : { content: node.value };
                const index = page.codeBlocks.push(codeBlock) - 1;

                return `<pre class="kbq-docs-pre"><kbq-code-block filled [files]="[codeBlocks[${index}]]" /></pre>`;
            }
            case 'mdxJsxFlowElement':
                if (node.name === 'Example') return renderExample(node);

                return /^[A-Z]/.test(node.name ?? '')
                    ? fail(node, `unknown component <${node.name}>`)
                    : renderElement(node, context);
            case 'mdxJsxTextElement':
                return /^[A-Z]/.test(node.name ?? '')
                    ? fail(node, `<${node.name}> has to stand on a line of its own`)
                    : renderElement(node, context);
            case 'mdxFlowExpression':
            case 'mdxTextExpression':
                // `{/* cspell:ignore … */}` and the like are for the tools, not for the reader.
                return isComment(node.value)
                    ? ''
                    : fail(node, 'imports, exports and {expressions} are not supported: pages compile to Angular');
            case 'mdxjsEsm':
                return fail(node, 'imports, exports and {expressions} are not supported: pages compile to Angular');
            default:
                return fail(node, `"${node.type}" is not supported yet`);
        }
    };

    page.template = render(parsePage(source, path), { inParagraph: false, inLink: false });

    return page;
}
