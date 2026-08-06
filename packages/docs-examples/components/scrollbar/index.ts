import { NgModule } from '@angular/core';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER } from '@koobiq/components/scrollbar';
import { PrivateScrollbarDisableInteractionExample } from './private-scrollbar-disable-interaction/private-scrollbar-disable-interaction-example';
import { PrivateScrollbarNativeExample } from './private-scrollbar-native/private-scrollbar-native-example';
import { PrivateScrollbarRtlExample } from './private-scrollbar-rtl/private-scrollbar-rtl-example';
import { PrivateScrollbarScrollToExample } from './private-scrollbar-scroll-to/private-scrollbar-scroll-to-example';
import { PrivateScrollbarVirtualScrollExample } from './private-scrollbar-virtual-scroll/private-scrollbar-virtual-scroll-example';
import { PrivateScrollbarVisibilityExample } from './private-scrollbar-visibility/private-scrollbar-visibility-example';
import { ScrollbarOverviewExample } from './scrollbar-overview/scrollbar-overview-example';
import { ScrollbarScrollToTopExample } from './scrollbar-scroll-to-top/scrollbar-scroll-to-top-example';
import { ScrollbarWithCustomConfigExample } from './scrollbar-with-custom-config/scrollbar-with-custom-config-example';

export {
    PrivateScrollbarDisableInteractionExample,
    PrivateScrollbarNativeExample,
    PrivateScrollbarRtlExample,
    PrivateScrollbarScrollToExample,
    PrivateScrollbarVirtualScrollExample,
    PrivateScrollbarVisibilityExample,
    ScrollbarOverviewExample,
    ScrollbarScrollToTopExample,
    ScrollbarWithCustomConfigExample
};

const EXAMPLES = [
    ScrollbarScrollToTopExample,
    ScrollbarOverviewExample,
    ScrollbarWithCustomConfigExample,
    PrivateScrollbarVisibilityExample,
    PrivateScrollbarVirtualScrollExample,
    PrivateScrollbarScrollToExample,
    PrivateScrollbarRtlExample,
    PrivateScrollbarNativeExample,
    PrivateScrollbarDisableInteractionExample
];

@NgModule({
    imports: EXAMPLES,
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER],
    exports: EXAMPLES
})
export class ScrollbarExamplesModule {}
