import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { TabActiveTabIndexExample } from './tab-active-tab-index/tab-active-tab-index-example';
import { TabActiveTabExample } from './tab-active-tab/tab-active-tab-example';
import { TabsEmptyExample } from './tabs-empty/tabs-empty-example';
import { TabsOldExample } from './tabs-old/tabs-old-example';
import { TabsOverviewExample } from './tabs-overview/tabs-overview-example';
import { TabsStretchExample } from './tabs-stretch/tabs-stretch-example';
import { TabsVerticalExample } from './tabs-vertical/tabs-vertical-example';
import { TabsWithScrollExample } from './tabs-with-scroll/tabs-with-scroll-example';

export {
    TabActiveTabExample,
    TabActiveTabIndexExample,
    TabsEmptyExample,
    TabsOldExample,
    TabsOverviewExample,
    TabsStretchExample,
    TabsVerticalExample,
    TabsWithScrollExample
};

const EXAMPLES = [
    TabsOverviewExample,
    TabsOldExample,
    TabsStretchExample,
    TabsVerticalExample,
    TabsWithScrollExample,
    TabsEmptyExample,
    TabActiveTabExample,
    TabActiveTabIndexExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqTabsModule,
        KbqIconModule,
        KbqButtonModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TabsExamplesModule {}
