import { NgModule } from '@angular/core';
import { AppSwitcherOverviewExample } from './app-switcher-overview/app-switcher-overview-example';
import { AppSwitcherSitesExample } from './app-switcher-sites/app-switcher-sites-example';

export { AppSwitcherOverviewExample, AppSwitcherSitesExample };

const EXAMPLES = [
    AppSwitcherOverviewExample,
    AppSwitcherSitesExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AppSwitcherExamplesModule {}
