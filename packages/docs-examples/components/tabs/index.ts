import { NgModule } from '@angular/core';
import { TabActiveTabIndexExample } from './tab-active-tab-index/tab-active-tab-index-example';
import { TabActiveTabExample } from './tab-active-tab/tab-active-tab-example';
import { TabsActionbarExample } from './tabs-actionbar/tabs-actionbar-example';
import { TabsCustomExample } from './tabs-custom/tabs-custom-example';
import { TabsDisabledExample } from './tabs-disabled/tabs-disabled-example';
import { TabsEmptyExample } from './tabs-empty/tabs-empty-example';
import { TabsOverviewExample } from './tabs-overview/tabs-overview-example';
import { TabsStretchExample } from './tabs-stretch/tabs-stretch-example';
import { TabsUnderlinedExample } from './tabs-underlined/tabs-underlined-example';
import { TabsVerticalIconsExample } from './tabs-vertical-icons/tabs-vertical-icons-example';
import { TabsVerticalExample } from './tabs-vertical/tabs-vertical-example';
import { TabsWithScrollVerticalExample } from './tabs-with-scroll-vertical/tabs-with-scroll-vertical-example';
import { TabsWithScrollExample } from './tabs-with-scroll/tabs-with-scroll-example';

export {
    TabActiveTabExample,
    TabActiveTabIndexExample,
    TabsActionbarExample,
    TabsCustomExample,
    TabsDisabledExample,
    TabsEmptyExample,
    TabsOverviewExample,
    TabsStretchExample,
    TabsUnderlinedExample,
    TabsVerticalExample,
    TabsVerticalIconsExample,
    TabsWithScrollExample,
    TabsWithScrollVerticalExample
};

const EXAMPLES = [
    TabsActionbarExample,
    TabsCustomExample,
    TabsOverviewExample,
    TabsDisabledExample,
    TabsStretchExample,
    TabsUnderlinedExample,
    TabsVerticalExample,
    TabsVerticalIconsExample,
    TabsWithScrollExample,
    TabsWithScrollVerticalExample,
    TabsEmptyExample,
    TabActiveTabExample,
    TabActiveTabIndexExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TabsExamplesModule {}
