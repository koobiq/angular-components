import { NgModule } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
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
    declarations: EXAMPLES,
    imports: [KbqBadgeModule, KbqIconModule, KbqTableModule, KbqToolTipModule, KbqLinkModule],
    exports: EXAMPLES
})
export class BadgeExamplesModule {}
