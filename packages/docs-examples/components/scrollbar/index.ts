import { NgModule } from '@angular/core';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER } from '@koobiq/components/scrollbar';
import { ScrollbarScrollToTopExample } from './scrollbar-scroll-to-top/scrollbar-scroll-to-top-example';
import { ScrollbarWithCustomConfigExample } from './scrollbar-with-custom-config/scrollbar-with-custom-config-example';
import { ScrollbarWithOptionsExample } from './scrollbar-with-options/scrollbar-with-options-example';

export { ScrollbarScrollToTopExample, ScrollbarWithCustomConfigExample, ScrollbarWithOptionsExample };

const EXAMPLES = [
    ScrollbarScrollToTopExample,
    ScrollbarWithOptionsExample,
    ScrollbarWithCustomConfigExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES,
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER]
})
export class ScrollbarExamplesModule {}
