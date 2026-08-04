import { NgModule } from '@angular/core';
import { KbqScrollbar, KbqScrollbarVirtualViewport } from './scrollbar';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarVirtualViewport
];

/**
 * NgModule wrapper for KbqScrollbar — for legacy (non-standalone) consumers.
 * @docs-private
 */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
