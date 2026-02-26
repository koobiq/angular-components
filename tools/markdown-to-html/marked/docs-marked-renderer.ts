import { Renderer, Tokens } from 'marked';
import { basename, extname } from 'path';
import {
    CLASS_PREFIX,
    MARKDOWN_TAGS_TO_CLASS_ALIAS,
    MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS
} from './../../../packages/components/markdown/markdown.values';

/** Regular expression that matches example comments. */
const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;

function createTagNameStringAliaser(classPrefix: string) {
    return (content: string) => {
        let str = setImageCaption(content);

        MARKDOWN_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            str = str.replace(new RegExp(`<${tag}`, 'g'), (_match: string) => `<${tag} class="${classPrefix}__${tag}"`);
        });

        MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            str = str.replace(
                new RegExp(`<${tag}\s*>`, 'g'),
                (_match: string) => `<${tag} class="${classPrefix}__${tag}">`
            );
        });

        return str;
    };
}

function setImageCaption(content: string): string {
    let html = content;
    let pos = 0;

    while (html.includes('<img', pos)) {
        const imgIndex = html.indexOf('<img', pos);
        const captionIndex = html.indexOf('>', imgIndex) + 1;

        html = [html.slice(0, captionIndex), '<em>', html.slice(captionIndex)].join('');

        const captionEndIndex = html.indexOf('</', captionIndex);

        html = [html.slice(0, captionEndIndex), '</em>', html.slice(captionEndIndex)].join('');

        pos = imgIndex + 1;
    }

    return html;
}

const tagNameStringAliaser = createTagNameStringAliaser(CLASS_PREFIX);

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Koobiq docs.
 */
export class DocsMarkdownRenderer extends Renderer {
    /** Set of fragment links discovered in the currently rendered file. */

    constructor() {
        super();
    }

    // Transforms a Markdown code block into the corresponding HTML output. In our case, we
    // want to add a data-docs-code-language attribute to the code element.
    code({ text, lang, escaped }: Tokens.Code): string {
        const result = super.code({ text, lang, escaped } as Tokens.Code);

        return result.replace('<pre>', `<pre data-docs-code-language="${lang}">`);
    }

    /**
     * Transforms a Markdown heading into the corresponding HTML output. In our case, we
     * want to create a header-link for each H2, H3, and H4 heading. This allows users to jump to
     * specific parts of the docs.
     */
    heading({ tokens, depth }: Tokens.Heading): string {
        const text = this.parser.parseInline(tokens);

        if ([3, 4, 5].includes(depth)) {
            const escapedText = text.toLowerCase().replace(/\s/g, '-');

            return `
                <div id="${escapedText}" class="docs-header-link kbq-markdown__h${depth}">
                  <span header-link="${escapedText}"></span>
                  ${text}
                </div>
              `;
        } else {
            return `<div class="docs-header-link kbq-markdown__h${depth}">${text}</div>`;
        }
    }

    /** Transforms markdown links into the corresponding HTML output. */
    link({ href, title, tokens }: Tokens.Link): string {
        // We only want to fix up markdown links that are relative and do not refer to guides already.
        // Otherwise we always map the link to the "guides/" path.
        if (!href.startsWith('http') && !href.startsWith('#') && href.includes('guides/')) {
            return super.link({ href: `guide/${basename(href, extname(href))}`, title, tokens } as Tokens.Link);
        }

        // Keep track of all fragments discovered in a file.
        // if (href.startsWith('#')) {
        //   this._referencedFragments.add(href.slice(1));
        // }

        return super.link({ href, title, tokens } as Tokens.Link);
    }

    /**
     * Method that will be called whenever inline HTML is processed by marked. In that case,
     * we can easily transform the example comments into real HTML elements.
     * For example:
     * (New API)
     * `<!-- example(
     *   {
     *    "example": "exampleName",
     *    "file": "example-html.html",
     *    "region": "some-region"
     *   }
     *  ) -->`
     *  turns into
     *  `<div koobiq-docs-example="exampleName"
     *        file="example-html.html"
     *        region="some-region"></div>`
     *
     *  (old API)
     *  `<!-- example(name) -->`
     *  turns into
     *  `<div koobiq-docs-example="name"></div>`
     */
    html(token: Tokens.HTML | Tokens.Tag): string {
        const text = token.text.replace(EXAMPLE_PATTERN, (_match: string, content: string) => {
            // using [\s\S]* because .* does not match line breaks
            if (content.match(/\{[\s\S]*\}/g)) {
                const { example, file, region } = JSON.parse(content) as {
                    example: string;
                    file: string;
                    region: string;
                };

                return `<div koobiq-docs-example="${example}"
                             ${file ? `file="${file}"` : ''}
                             ${region ? `region="${region}"` : ''}></div>`;
            } else {
                return `<div koobiq-docs-example="${content}"></div>`;
            }
        });

        return super.html({ ...token, text });
    }

    /**
     * Method that will be called after a markdown file has been transformed to HTML. This method
     * can be used to finalize the content (e.g. by adding an additional wrapper HTML element)
     */
    finalizeOutput(output: string): string {
        return tagNameStringAliaser(output);
    }
}
