import { NgModule } from '@angular/core';
import { ScrollbarOverviewExample } from './scrollbar-overview/scrollbar-overview-example';
import { ScrollbarScrollToExample } from './scrollbar-scroll-to/scrollbar-scroll-to-example';
import { ScrollbarVirtualScrollExample } from './scrollbar-virtual-scroll/scrollbar-virtual-scroll-example';

export { ScrollbarOverviewExample, ScrollbarScrollToExample, ScrollbarVirtualScrollExample };

const EXAMPLES = [
    ScrollbarOverviewExample,
    ScrollbarVirtualScrollExample,
    ScrollbarScrollToExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ScrollbarExamplesModule {}
