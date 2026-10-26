import { NgModule } from '@angular/core';
import { KbqMarkdown } from './markdown.component';

const COMPONENTS = [
    KbqMarkdown
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqMarkdownModule {}
