import { NgModule } from '@angular/core';
import { TabsActionbarExample } from './tabs-actionbar/tabs-actionbar-example';
import { TabsActiveTabIdExample } from './tabs-active-tab-id/tabs-active-tab-id-example';
import { TabsActiveTabIndexExample } from './tabs-active-tab-index/tabs-active-tab-index-example';
import { TabsCustomLabelExample } from './tabs-custom-label/tabs-custom-label-example';
import { TabsDisabledExample } from './tabs-disabled/tabs-disabled-example';
import { TabsEmptyLabelExample } from './tabs-empty-label/tabs-empty-label-example';
import { TabsNavBarOverviewExample } from './tabs-nav-bar-overview/tabs-nav-bar-overview-example';
import { TabsOverviewExample } from './tabs-overview/tabs-overview-example';
import { TabsStretchExample } from './tabs-stretch/tabs-stretch-example';
import { TabsUnderlinedExample } from './tabs-underlined/tabs-underlined-example';
import { TabsVerticalIconsExample } from './tabs-vertical-icons/tabs-vertical-icons-example';
import { TabsVerticalExample } from './tabs-vertical/tabs-vertical-example';
import { TabsWithScrollVerticalExample } from './tabs-with-scroll-vertical/tabs-with-scroll-vertical-example';
import { TabsWithScrollExample } from './tabs-with-scroll/tabs-with-scroll-example';

export {
    TabsActionbarExample,
    TabsActiveTabIdExample,
    TabsActiveTabIndexExample,
    TabsCustomLabelExample,
    TabsDisabledExample,
    TabsEmptyLabelExample,
    TabsNavBarOverviewExample,
    TabsOverviewExample,
    TabsStretchExample,
    TabsUnderlinedExample,
    TabsVerticalExample,
    TabsVerticalIconsExample,
    TabsWithScrollExample,
    TabsWithScrollVerticalExample
};

const EXAMPLES = [
    TabsActiveTabIdExample,
    TabsActiveTabIndexExample,
    TabsActionbarExample,
    TabsCustomLabelExample,
    TabsDisabledExample,
    TabsEmptyLabelExample,
    TabsNavBarOverviewExample,
    TabsOverviewExample,
    TabsStretchExample,
    TabsUnderlinedExample,
    TabsVerticalExample,
    TabsVerticalIconsExample,
    TabsWithScrollExample,
    TabsWithScrollVerticalExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TabsExamplesModule {}
