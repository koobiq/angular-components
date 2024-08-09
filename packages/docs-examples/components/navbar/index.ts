import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { NavbarOverviewExample } from './navbar-overview/navbar-overview-example';
import { NavbarVerticalOpenOverExample } from './navbar-vertical-open-over/navbar-vertical-open-over-example';
import { NavbarVerticalExample } from './navbar-vertical/navbar-vertical-example';

export { NavbarOverviewExample, NavbarVerticalExample, NavbarVerticalOpenOverExample };

const EXAMPLES = [
    NavbarOverviewExample,
    NavbarVerticalExample,
    NavbarVerticalOpenOverExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqNavbarModule,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqPopoverModule,
        KbqToolTipModule,
        KbqBadgeModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqDividerModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {}
