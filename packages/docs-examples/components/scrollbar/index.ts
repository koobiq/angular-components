import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER, KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { ScrollbarOverviewExample } from './scrollbar-overview/scrollbar-overview-example';
import { ScrollbarScrollToTopExample } from './scrollbar-scroll-to-top/scrollbar-scroll-to-top-example';

export { ScrollbarOverviewExample, ScrollbarScrollToTopExample };

const EXAMPLES = [
    ScrollbarOverviewExample,
    ScrollbarScrollToTopExample,
];

@NgModule({
    imports: [
        BrowserModule,
        KbqButtonModule,
        KbqScrollbarModule,
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER],
})
export class ScrollbarExamplesModule {}
