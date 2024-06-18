import { NgModule } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';

import { BadgeContentExample } from './badge-content/badge-content-example';
import { BadgeFillAndStyleExample } from './badge-fill-and-style/badge-fill-and-style-example';
import { BadgeHugContentExample } from './badge-hug-content/badge-hug-content-example';
import { BadgeOverviewExample } from './badge-overview/badge-overview-example';
import { BadgeSizeExample } from './badge-size/badge-size-example';


export {
    BadgeOverviewExample,
    BadgeSizeExample,
    BadgeFillAndStyleExample,
    BadgeContentExample,
    BadgeHugContentExample
};

const EXAMPLES = [
    BadgeOverviewExample,
    BadgeSizeExample,
    BadgeFillAndStyleExample,
    BadgeContentExample,
    BadgeHugContentExample
];

@NgModule({
    declarations: EXAMPLES,
    imports: [KbqBadgeModule, KbqIconModule],
    exports: EXAMPLES
})
export class BadgeExamplesModule {}
