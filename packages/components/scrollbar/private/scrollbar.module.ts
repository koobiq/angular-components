import { NgModule } from '@angular/core';
import { KbqScrollbar, KbqScrollbarVirtualViewport } from './scrollbar';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarVirtualViewport
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
