import { NgModule } from '@angular/core';
import { ScrollbarDisableInteractionExample } from './scrollbar-disable-interaction/scrollbar-disable-interaction-example';
import { ScrollbarNativeExample } from './scrollbar-native/scrollbar-native-example';
import { ScrollbarOverviewExample } from './scrollbar-overview/scrollbar-overview-example';
import { ScrollbarRtlExample } from './scrollbar-rtl/scrollbar-rtl-example';
import { ScrollbarScrollToExample } from './scrollbar-scroll-to/scrollbar-scroll-to-example';
import { ScrollbarVirtualScrollExample } from './scrollbar-virtual-scroll/scrollbar-virtual-scroll-example';

export {
    ScrollbarDisableInteractionExample,
    ScrollbarNativeExample,
    ScrollbarOverviewExample,
    ScrollbarRtlExample,
    ScrollbarScrollToExample,
    ScrollbarVirtualScrollExample
};

const EXAMPLES = [
    ScrollbarOverviewExample,
    ScrollbarVirtualScrollExample,
    ScrollbarScrollToExample,
    ScrollbarRtlExample,
    ScrollbarNativeExample,
    ScrollbarDisableInteractionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ScrollbarExamplesModule {}
