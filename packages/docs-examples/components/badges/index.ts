import { NgModule } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';

import { BadgesContentExample } from './badges-content/badges-content-example';
import { BadgesFillAndStyleExample } from './badges-fill-and-style/badges-fill-and-style-example';
import { BadgesHugContentExample } from './badges-hug-content/badges-hug-content-example';
import { BadgesOverviewExample } from './badges-overview/badges-overview-example';
import { BadgesSizeExample } from './badges-size/badges-size-example';


export {
    BadgesOverviewExample,
    BadgesSizeExample,
    BadgesFillAndStyleExample,
    BadgesContentExample,
    BadgesHugContentExample
};

const EXAMPLES = [
    BadgesOverviewExample,
    BadgesSizeExample,
    BadgesFillAndStyleExample,
    BadgesContentExample,
    BadgesHugContentExample
];

@NgModule({
    declarations: EXAMPLES,
    imports: [KbqBadgeModule, KbqIconModule],
    exports: EXAMPLES
})
export class BadgesExamplesModule {}
