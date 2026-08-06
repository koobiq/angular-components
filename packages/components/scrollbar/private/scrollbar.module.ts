import { NgModule } from '@angular/core';
import { KbqScrollbar, KbqScrollbarVirtualViewport } from './scrollbar';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarVirtualViewport
];

/** NOTE! Intended exclusively for use within this repository. */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
