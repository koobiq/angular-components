import { CompiledCodeBlock, compilePage, renderCodeBlockElement } from '../../../docs-pages/compile-page';
import { renderCodeBlock } from '../code-block';

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
 * Binds each block of code the compiler collected into its `kbq-code-block` inline: an MDX page binds them
 * from a class field, which a generated API page does not have.
 */
function inlineCodeBlocks(template: string, codeBlocks: CompiledCodeBlock[]): string {
    return codeBlocks.reduce((result, { content, language }, index) => {
        const placeholder = renderCodeBlockElement(index);

        // A replacer function, not a string: a string replacement gives `$&`/`$'`/`$1`... their special
        // meaning, and an example array like `['!', '$', ...]` genuinely contains the two-character
        // sequence `$'` — as a string replacement that means "everything after the match", splicing the
        // rest of the template into the middle of this code block.
        return result.replace(placeholder, () => renderCodeBlock(content, { language }));
    }, template);
}

/**
 * Compiles a JsDoc comment's Markdown into an Angular template fragment, reusing the compiler that turns
 * MDX pages into templates (`tools/docs-pages/compile-page.ts`) so every rendered doc on the site goes
 * through one Markdown dialect and one set of `kbq-markdown__*` classes. What that compiler rejects in a
 * page — a bare `{`, a tag outside its short list, `<br>` without the slash — fails the build here as well:
 * the comment gets fixed rather than shown mangled.
 *
 * @param context Identifies the declaration in a compile error, e.g. `KbqSelect.panelMaxHeight` — the
 *   extracted comment has no line mapping back into the original `.ts` file to point at instead.
 */
export function renderJsDocMarkdown(text: string, context: string): string {
    if (!text.trim()) return '';

    // A heading sits under the entry's own `h3`: one level below it, and no anchor of its own, which each
    // comment would number from scratch and so repeat across the page.
    const { template, codeBlocks } = compilePage(resolveLinkTags(text), {
        path: context,
        examples: {},
        url: null,
        headingDepth: 4
    });

    return codeBlocks.length ? inlineCodeBlocks(template, codeBlocks) : template;
}
