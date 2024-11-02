import { NgModule } from '@angular/core';
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
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {}
