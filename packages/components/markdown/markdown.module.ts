import { NgModule } from '@angular/core';
import { KbqMarkdown } from './markdown.component';
import { KbqMarkdownService } from './markdown.service';

const COMPONENTS = [
    KbqMarkdown
];

@NgModule({
    imports: COMPONENTS,
    providers: [KbqMarkdownService],
    exports: COMPONENTS
})
export class KbqMarkdownModule {}
