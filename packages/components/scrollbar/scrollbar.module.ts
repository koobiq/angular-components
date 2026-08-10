import { NgModule } from '@angular/core';
import { KbqScrollbar, KbqScrollbarViewport } from './scrollbar';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarViewport
];

/** @docs-private */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
