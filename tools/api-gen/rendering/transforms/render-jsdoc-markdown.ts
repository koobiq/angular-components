import type { DocsApiBlock } from '../../../../apps/docs/src/app/components/api-page/api-page.types';
import { CompiledBlock, compilePage } from '../../../docs-pages/compile-page';

/** `{@link Foo}` / `{@link Foo | label}` — the compiler leaves these in the text verbatim. */
const INLINE_LINK_TAG = /\{\s*@link\s+([^}|]+?)(?:\s*\|\s*([^}]+))?\s*\}/g;

/**
 * `{@link Foo}` is standard JSDoc that MDX would read as an expression. It becomes inline code rather than
 * a link: the generator does not know where the page of every symbol lives.
 */
function resolveLinkTags(text: string): string {
    return text.replace(INLINE_LINK_TAG, (_match, target: string, label?: string) => `\`${(label ?? target).trim()}\``);
}

/**
 * Compiles the Markdown of a JSDoc comment into the blocks the API page renders: HTML, and the code in
 * between, which the page highlights. It goes through the compiler of the MDX pages
 * (`tools/docs-pages/compile-page.ts`), so every text on the site follows one Markdown dialect and one set of
 * `kbq-markdown__*` classes. What that compiler rejects in a page — a bare `{`, a tag outside its short list,
 * `<br>` without the slash — fails the build here as well: the comment gets fixed rather than shown mangled.
 *
 * @param context Identifies the declaration in a compile error, e.g. `KbqSelect.panelMaxHeight` — the
 *   extracted comment has no line mapping back into the original `.ts` file to point at instead.
 */
export function renderJsDocMarkdown(text: string, context: string): DocsApiBlock[] {
    if (!text.trim()) return [];

    let topLevel: CompiledBlock[] = [];
    // A heading sits under the entry's own `h3`: one level below it, and no anchor of its own, which each
    // comment would number from scratch and so repeat across the page.
    const { codeBlocks } = compilePage(resolveLinkTags(text), {
        path: context,
        examples: {},
        url: null,
        headingDepth: 4,
        output: 'html',
        layout: (blocks) => {
            topLevel = blocks;

            return '';
        }
    });

    if (topLevel.filter(({ node }) => node.type === 'code').length < codeBlocks.length) {
        throw new Error(`${context}: a block of code has to stand on its own, outside a list or a quote`);
    }

    const files = [...codeBlocks];
    const blocks: DocsApiBlock[] = [];

    for (const { node, template } of topLevel) {
        const last = blocks[blocks.length - 1];

        if (node.type === 'code') {
            const { content, language } = files.shift()!;

            blocks.push({ type: 'code', code: content, language });
        } else if (last?.type === 'html') {
            // Consecutive blocks of prose are one HTML block.
            last.html += template;
        } else if (template) {
            blocks.push({ type: 'html', html: template });
        }
    }

    return blocks;
}
