import { NgModule } from '@angular/core';
import { KbqNativeScrollbar, KbqScrollbar, KbqScrollbarViewport } from './scrollbar';

const COMPONENTS = [
    KbqNativeScrollbar,
    KbqScrollbar,
    KbqScrollbarViewport
];

/** @docs-private */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
