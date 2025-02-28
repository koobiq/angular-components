import { Injectable } from '@angular/core';
import { marked, MarkedOptions } from 'marked';
import { CLASS_PREFIX, MARKDOWN_TAGS_TO_CLASS_ALIAS, MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS } from './markdown.values';

/**
 * Service for converting Markdown into HTML.
 */
@Injectable()
export class KbqMarkdownService {
    /**
     * Converts a given Markdown string into HTML.
     * NOTE! Method does not sanitize the output HTML string.
     *
     * @param markdown - The Markdown string to be converted.
     * @param options - Optional MarkedOptions to customize the parsing behavior.
     * @returns The transformed HTML string.
     */
    parseToHtml(markdown: string, options?: MarkedOptions): string {
        return this.transform(<string>marked.parse(markdown, options));
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
