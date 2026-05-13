import { NgModule } from '@angular/core';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER } from '@koobiq/components/scrollbar';
import { ScrollbarOverviewExample } from './scrollbar-overview/scrollbar-overview-example';
import { ScrollbarScrollToTopExample } from './scrollbar-scroll-to-top/scrollbar-scroll-to-top-example';
import { ScrollbarWithCustomConfigExample } from './scrollbar-with-custom-config/scrollbar-with-custom-config-example';

export { ScrollbarOverviewExample, ScrollbarScrollToTopExample, ScrollbarWithCustomConfigExample };

const EXAMPLES = [
    ScrollbarScrollToTopExample,
    ScrollbarOverviewExample,
    ScrollbarWithCustomConfigExample
];

@NgModule({
    imports: EXAMPLES,
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER],
    exports: EXAMPLES
})
export class ScrollbarExamplesModule {}
