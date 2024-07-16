import { Injectable } from '@angular/core';
import { marked } from 'marked';
import { CLASS_PREFIX, MARKDOWN_TAGS_TO_CLASS_ALIAS, MARKDOWN_WHOLE_TAGS_TO_CLASS_ALIAS } from './markdown.values';

@Injectable()
export class KbqMarkdownService {
    parseToHtml(markdown: string): string {
        return this.transform(marked.parse(markdown));
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
