import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { TabActiveTabIndexExample } from './tab-active-tab-index/tab-active-tab-index-example';
import { TabActiveTabExample } from './tab-active-tab/tab-active-tab-example';
import { TabsDisabledExample } from './tabs-disabled/tabs-disabled-example';
import { TabsEmptyExample } from './tabs-empty/tabs-empty-example';
import { TabsOverviewExample } from './tabs-overview/tabs-overview-example';
import { TabsStretchExample } from './tabs-stretch/tabs-stretch-example';
import { TabsVerticalIconsExample } from './tabs-vertical-icons/tabs-vertical-icons-example';
import { TabsVerticalExample } from './tabs-vertical/tabs-vertical-example';
import { TabsWithScrollExample } from './tabs-with-scroll/tabs-with-scroll-example';

export {
    TabActiveTabExample,
    TabActiveTabIndexExample,
    TabsDisabledExample,
    TabsEmptyExample,
    TabsOverviewExample,
    TabsStretchExample,
    TabsVerticalExample,
    TabsVerticalIconsExample,
    TabsWithScrollExample
};

const EXAMPLES = [
    TabsOverviewExample,
    TabsDisabledExample,
    TabsStretchExample,
    TabsVerticalExample,
    TabsVerticalIconsExample,
    TabsWithScrollExample,
    TabsEmptyExample,
    TabActiveTabExample,
    TabActiveTabIndexExample
];

@NgModule({
    imports: [
        KbqTabsModule,
        KbqIconModule,
        KbqButtonModule,
        KbqToolTipModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TabsExamplesModule {}
