import { NgModule } from '@angular/core';
import { AppSwitcherOverviewExample } from './app-switcher-overview/app-switcher-overview-example';

export { AppSwitcherOverviewExample };

const EXAMPLES = [
    AppSwitcherOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AppSwitcherExamplesModule {}
