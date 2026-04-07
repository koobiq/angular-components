import { NgModule } from '@angular/core';
import { BadgeContentExample } from './badge-content/badge-content-example';
import { BadgeListExample } from './badge-list/badge-list-example';
import { BadgeOverviewExample } from './badge-overview/badge-overview-example';
import { BadgeSizeExample } from './badge-size/badge-size-example';
import { BadgeTableExample } from './badge-table/badge-table-example';
import { BadgeTooltipExample } from './badge-tooltip/badge-tooltip-example';

export {
    BadgeContentExample,
    BadgeListExample,
    BadgeOverviewExample,
    BadgeSizeExample,
    BadgeTableExample,
    BadgeTooltipExample
};

const EXAMPLES = [
    BadgeContentExample,
    BadgeOverviewExample,
    BadgeListExample,
    BadgeSizeExample,
    BadgeTableExample,
    BadgeTooltipExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BadgeExamplesModule {}
