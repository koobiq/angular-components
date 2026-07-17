import { NgModule } from '@angular/core';
import { NavbarAppLongNameExample } from './navbar-app-long-name/navbar-app-long-name-example';
import { NavbarOverviewExample } from './navbar-overview/navbar-overview-example';
import { NavbarVerticalAppLongNameExample } from './navbar-vertical-app-long-name/navbar-vertical-app-long-name-example';
import { NavbarVerticalOpenOverExample } from './navbar-vertical-open-over/navbar-vertical-open-over-example';
import { NavbarVerticalExample } from './navbar-vertical/navbar-vertical-example';

export {
    NavbarAppLongNameExample,
    NavbarOverviewExample,
    NavbarVerticalAppLongNameExample,
    NavbarVerticalExample,
    NavbarVerticalOpenOverExample
};

const EXAMPLES = [
    NavbarOverviewExample,
    NavbarVerticalExample,
    NavbarVerticalOpenOverExample,
    NavbarVerticalAppLongNameExample,
    NavbarAppLongNameExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {}
