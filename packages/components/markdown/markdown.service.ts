import { Injectable } from '@angular/core';
import { marked, MarkedOptions } from 'marked';
import { CLASS_PREFIX, MARKDOWN_TAGS_TO_CLASS_ALIAS, MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS } from './markdown.values';

/** Service which allows to convert `Markdown` into `HTML` */
@Injectable()
export class KbqMarkdownService {
    /** Parses `Markdown` into `HTML` */
    parseToHtml(markdown: string, options?: MarkedOptions): string {
        return this.transform(marked.parse(markdown, options));
    }

    private transform(htmlContent: string): string {
        let transformed = htmlContent;

        MARKDOWN_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            transformed = transformed.replace(
                new RegExp(`<${tag}`, 'g'),
                (_match: string) => `<${tag} class="${CLASS_PREFIX}__${tag}"`
            );
        });

        MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS.forEach((tag) => {
            transformed = transformed.replace(
                new RegExp(`<${tag}\s*>`, 'g'),
                (_match: string) => `<${tag} class="${CLASS_PREFIX}__${tag}">`
            );
        });

        return transformed;
    }
}
