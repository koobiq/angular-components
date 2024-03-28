import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

import { NavbarOverviewExample } from './navbar-overview/navbar-overview-example';
import { NavbarVerticalExample } from './navbar-vertical/navbar-vertical-example';


export {
    NavbarOverviewExample,
    NavbarVerticalExample
};

const EXAMPLES = [
    NavbarOverviewExample,
    NavbarVerticalExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqNavbarModule,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqPopoverModule,
        KbqToolTipModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {}
