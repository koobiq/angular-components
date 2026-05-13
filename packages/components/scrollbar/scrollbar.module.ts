import { NgModule } from '@angular/core';
import { KbqScrollbar } from './scrollbar.component';
import { KbqScrollbarDirective } from './scrollbar.directive';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER } from './scrollbar.types';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarDirective
];

@NgModule({
    imports: COMPONENTS,
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER],
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
