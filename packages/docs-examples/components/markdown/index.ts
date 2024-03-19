import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

import { MarkdownOverviewExample } from './markdown-overview/markdown-overview-example';
import { MarkdownTypographyExample } from './markdown-typography/markdown-typography-example';


export {
    MarkdownOverviewExample,
    MarkdownTypographyExample
};

const EXAMPLES = [
    MarkdownOverviewExample,
    MarkdownTypographyExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqMarkdownModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class MarkdownExamplesModule {}
