import { NgModule } from '@angular/core';
import { BadgeContentExample } from './badge-content/badge-content-example';
import { BadgeFillAndStyleExample } from './badge-fill-and-style/badge-fill-and-style-example';
import { BadgeListExample } from './badge-list/badge-list-example';
import { BadgeSizeExample } from './badge-size/badge-size-example';
import { BadgeTableExample } from './badge-table/badge-table-example';
import { BadgeTooltipExample } from './badge-tooltip/badge-tooltip-example';

export {
    BadgeContentExample,
    BadgeFillAndStyleExample,
    BadgeListExample,
    BadgeSizeExample,
    BadgeTableExample,
    BadgeTooltipExample
};

const EXAMPLES = [
    BadgeContentExample,
    BadgeFillAndStyleExample,
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
