import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqHighlightPipe } from './highlight.pipe';

@NgModule({
    imports: [CommonModule, KbqHighlightPipe],
    exports: [KbqHighlightPipe]
})
export class KbqHighlightModule {}

export * from './highlight.pipe';
