import { NgModule } from '@angular/core';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER } from '@koobiq/components/scrollbar';
import { ScrollbarInputCustomizationExample } from './scrollbar-input-customization/scrollbar-input-customization-example';
import { ScrollbarModuleCustomizationExample } from './scrollbar-module-customization/scrollbar-module-customization-example';
import { ScrollbarOverviewExample } from './scrollbar-overview/scrollbar-overview-example';
import { ScrollbarScrollToTopExample } from './scrollbar-scroll-to-top/scrollbar-scroll-to-top-example';

export {
    ScrollbarInputCustomizationExample,
    ScrollbarModuleCustomizationExample,
    ScrollbarOverviewExample,
    ScrollbarScrollToTopExample
};

const EXAMPLES = [
    ScrollbarOverviewExample,
    ScrollbarScrollToTopExample,
    ScrollbarInputCustomizationExample,
    ScrollbarModuleCustomizationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES,
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER]
})
export class ScrollbarExamplesModule {}
