import { NgModule } from '@angular/core';
import { KbqHighlightPipe } from './highlight.pipe';

@NgModule({
    imports: [KbqHighlightPipe],
    exports: [KbqHighlightPipe]
})
export class KbqHighlightModule {}

export * from './highlight.pipe';
