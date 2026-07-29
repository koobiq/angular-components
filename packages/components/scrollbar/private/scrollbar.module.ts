import { NgModule } from '@angular/core';
import { KbqScrollbar, KbqScrollbarViewport } from './scrollbar';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarViewport
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
