import { NgModule } from '@angular/core';
import { KbqScrollbar, KbqScrollbarScrollIntoView, KbqScrollbarTrack, KbqScrollbarViewport } from './scrollbar';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarViewport,
    KbqScrollbarTrack,
    KbqScrollbarScrollIntoView
];

/** @docs-private */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
