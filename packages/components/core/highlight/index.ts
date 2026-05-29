import { NgModule } from '@angular/core';
import { KbqHighlightBackgroundPipe } from './highlight-background.pipe';
import { KbqHighlightPipe } from './highlight.pipe';

@NgModule({
    imports: [KbqHighlightPipe, KbqHighlightBackgroundPipe],
    exports: [KbqHighlightPipe, KbqHighlightBackgroundPipe]
})
export class KbqHighlightModule {}

export * from './highlight-background.pipe';
export { escapeRegExp } from './highlight-base';
export * from './highlight.pipe';
