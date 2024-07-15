import { NgModule } from '@angular/core';
import { KbqScrollbar } from './scrollbar.component';
import { KbqScrollbarDirective } from './scrollbar.directive';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER } from './scrollbar.types';

@NgModule({
    imports: [],
    declarations: [KbqScrollbar, KbqScrollbarDirective],
    exports: [KbqScrollbar, KbqScrollbarDirective],
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER],
})
export class KbqScrollbarModule {}
