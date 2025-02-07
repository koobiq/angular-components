import { NgModule } from '@angular/core';
import { TopMenuBreadcrumbsExample } from './top-menu-breadcrumbs/top-menu-breadcrumbs-example';
import { TopMenuOverflowExample } from './top-menu-overflow/top-menu-overflow-example';
import { TopMenuOverviewExample } from './top-menu-overview/top-menu-overview-example';

export { TopMenuBreadcrumbsExample, TopMenuOverflowExample, TopMenuOverviewExample };

const EXAMPLES = [
    TopMenuOverviewExample,
    TopMenuOverflowExample,
    TopMenuBreadcrumbsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TopMenuExamplesModule {}
