import { NgModule } from '@angular/core';
import { NavbarIcLongAppNameExample } from './navbar-ic-long-app-name/navbar-ic-long-app-name-overview-example';
import { NavbarIcOverviewExample } from './navbar-ic-overview/navbar-ic-overview-example';

export { NavbarIcLongAppNameExample, NavbarIcOverviewExample };

const EXAMPLES = [
    NavbarIcOverviewExample,
    NavbarIcLongAppNameExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarIcExamplesModule {}
