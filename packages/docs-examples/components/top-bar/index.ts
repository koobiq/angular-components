import { NgModule } from '@angular/core';
import { TopBarActionsExample } from './top-bar-actions/top-bar-actions-example';
import { TopBarBreadcrumbsAdaptiveExample } from './top-bar-breadcrumbs-adaptive/top-bar-breadcrumbs-adaptive-example';
import { TopBarBreadcrumbsExample } from './top-bar-breadcrumbs/top-bar-breadcrumbs-example';
import { TopBarOverflowExample } from './top-bar-overflow/top-bar-overflow-example';
import { TopBarOverviewExample } from './top-bar-overview/top-bar-overview-example';
import { TopBarTitleCounterAdaptiveExample } from './top-bar-title-counter-adaptive/top-bar-title-counter-adaptive-example';
import { TopBarTitleCounterExample } from './top-bar-title-counter/top-bar-title-counter-example';

export {
    TopBarActionsExample,
    TopBarBreadcrumbsAdaptiveExample,
    TopBarBreadcrumbsExample,
    TopBarOverflowExample,
    TopBarOverviewExample,
    TopBarTitleCounterAdaptiveExample,
    TopBarTitleCounterExample
};

const EXAMPLES = [
    TopBarActionsExample,
    TopBarBreadcrumbsExample,
    TopBarOverflowExample,
    TopBarOverviewExample,
    TopBarTitleCounterExample,
    TopBarTitleCounterAdaptiveExample,
    TopBarBreadcrumbsAdaptiveExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TopBarExamplesModule {}
