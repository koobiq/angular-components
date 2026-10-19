import { NgModule } from '@angular/core';
import { KbqHighlightBackgroundPipe } from './highlight-background.pipe';
import { KbqHighlightBoldPipe } from './highlight-bold.pipe';
import { KbqHighlightPipe } from './highlight.pipe';

@NgModule({
    imports: [KbqHighlightPipe, KbqHighlightBoldPipe, KbqHighlightBackgroundPipe],
    exports: [KbqHighlightPipe, KbqHighlightBoldPipe, KbqHighlightBackgroundPipe]
})
export class KbqHighlightModule {}

export * from './highlight-background.pipe';
export { escapeRegExp } from './highlight-base';
export * from './highlight-bold.pipe';
export * from './highlight.pipe';
