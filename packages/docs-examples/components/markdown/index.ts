import { NgModule } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';
import { MarkdownArticleExample } from './markdown-article/markdown-article-example';
import { MarkdownCodeBlockExample } from './markdown-code-block/markdown-code-block-example';
import { MarkdownCodeExample } from './markdown-code/markdown-code-example';
import { MarkdownDividerExample } from './markdown-divider/markdown-divider-example';
import { MarkdownHeadersCombinationsExample } from './markdown-headers-combinations/markdown-headers-combinations-example';
import { MarkdownHeadersExample } from './markdown-headers/markdown-headers-example';
import { MarkdownImageExample } from './markdown-image/markdown-image-example';
import { MarkdownLineBreakExample } from './markdown-line-break/markdown-line-break-example';
import { MarkdownLinkExample } from './markdown-link/markdown-link-example';
import { MarkdownListExample } from './markdown-list/markdown-list-example';
import { MarkdownParagraphExample } from './markdown-paragraph/markdown-paragraph-example';
import { MarkdownQuoteExample } from './markdown-quote/markdown-quote-example';
import { MarkdownSelectionExample } from './markdown-selection/markdown-selection-example';
import { MarkdownTableExample } from './markdown-table/markdown-table-example';

export {
    MarkdownArticleExample,
    MarkdownCodeBlockExample,
    MarkdownCodeExample,
    MarkdownDividerExample,
    MarkdownHeadersCombinationsExample,
    MarkdownHeadersExample,
    MarkdownImageExample,
    MarkdownLineBreakExample,
    MarkdownLinkExample,
    MarkdownListExample,
    MarkdownParagraphExample,
    MarkdownQuoteExample,
    MarkdownSelectionExample,
    MarkdownTableExample
};

const EXAMPLES = [
    MarkdownArticleExample,
    MarkdownCodeExample,
    MarkdownCodeBlockExample,
    MarkdownDividerExample,
    MarkdownHeadersExample,
    MarkdownHeadersCombinationsExample,
    MarkdownImageExample,
    MarkdownLineBreakExample,
    MarkdownLinkExample,
    MarkdownListExample,
    MarkdownParagraphExample,
    MarkdownQuoteExample,
    MarkdownSelectionExample,
    MarkdownTableExample
];

@NgModule({
    imports: [
        KbqMarkdownModule,
        KbqMarkdownModule,
        KbqMarkdownModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class MarkdownExamplesModule {}
