import { NgModule } from '@angular/core';
import { KbqHighlightPipe } from './highlight.pipe';
import { KbqHighlightBackgroundPipe } from './highlight-background.pipe';
import { KbqHighlightBoldPipe } from './highlight-bold.pipe';

@NgModule({
    imports: [KbqHighlightPipe, KbqHighlightBoldPipe, KbqHighlightBackgroundPipe],
    exports: [KbqHighlightPipe, KbqHighlightBoldPipe, KbqHighlightBackgroundPipe]
})
export class KbqHighlightModule {}

export * from './highlight.pipe';
export * from './highlight-background.pipe';
export { escapeRegExp } from './highlight-base';
export * from './highlight-bold.pipe';
