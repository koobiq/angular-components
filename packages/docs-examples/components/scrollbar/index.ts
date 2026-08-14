import { NgModule } from '@angular/core';
import { NativeScrollbarExample } from './native-scrollbar/native-scrollbar-example';
import { ScrollbarOverviewExample } from './scrollbar-overview/scrollbar-overview-example';
import { ScrollbarScrollToExample } from './scrollbar-scroll-to/scrollbar-scroll-to-example';
import { ScrollbarVirtualScrollExample } from './scrollbar-virtual-scroll/scrollbar-virtual-scroll-example';

export { NativeScrollbarExample, ScrollbarOverviewExample, ScrollbarScrollToExample, ScrollbarVirtualScrollExample };

const EXAMPLES = [
    ScrollbarOverviewExample,
    ScrollbarVirtualScrollExample,
    ScrollbarScrollToExample,
    NativeScrollbarExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ScrollbarExamplesModule {}
