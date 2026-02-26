import highlightJs from 'highlight.js';
import { Renderer, Tokens } from 'marked';
import { splitLines } from '../transforms/code-transforms';

/**
 * Custom renderer for marked that will be used to transform markdown files to HTML
 * files that can be used in the Angular docs.
 */
export const renderer: Partial<Renderer> = {
    code({ text, lang }: Tokens.Code): string {
        let highlightResult;

        // Use try catch because there are existing content issues when there is provided nonexistent
        // language, like `typescript=` etc. In that case when there will be an error thrown `Could not
        // find the language 'typescript=', did you forget to load/include a language module?`
        // Let's try to use `highlightAuto`.
        try {
            highlightResult = lang ? highlightJs.highlight(text, { language: lang }) : highlightJs.highlightAuto(text);
        } catch {
            highlightResult = highlightJs.highlightAuto(text);
        }

        const lines = splitLines(highlightResult.value);

        // TODO: rewrite
        return `
      <div class="docs-code" role="group">
        <pre class="docs-mini-scroll-track">
          <code>
            ${lines.map((line: string) => `<span class="hljs-ln-line">${line}</span>`).join('')}
          </code>
        </pre>
      </div>
    `;
    },
    image({ href, title, text }: Tokens.Image): string {
        return `
    <img src="${href}" alt="${text}" title="${title}" class="docs-image">
    `;
    },
    link(this: Renderer, { href, tokens }: Tokens.Link): string {
        const text = this.parser.parseInline(tokens);

        return `<a href="${href}">${text}</a>`;
    },
    list(this: Renderer, token: Tokens.List): string {
        const body = token.items.map((item) => this.listitem(item)).join('');

        if (token.ordered) {
            return `
      <ol class="docs-ordered-list">
        ${body}
      </ol>
      `;
        }

        return `
    <ul class="docs-list">
      ${body}
    </ul>
    `;
    },
    table(this: Renderer, token: Tokens.Table): string {
        let headerCells = '';

        for (const cell of token.header) {
            headerCells += this.tablecell(cell);
        }

        const header = this.tablerow({ text: headerCells });

        let body = '';

        for (const row of token.rows) {
            let cells = '';

            for (const cell of row) {
                cells += this.tablecell(cell);
            }

            body += this.tablerow({ text: cells });
        }

        return `
      <div class="docs-table docs-scroll-track-transparent">
        <table>
          <thead>
            ${header}
          </thead>
          <tbody>
            ${body}
          </tbody>
        </table>
      </div>
    `;
    }
};
