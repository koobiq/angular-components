import { NgModule } from '@angular/core';
import { TopBarActiveBreadcrumbExample } from './top-bar-active-breadcrumb/top-bar-active-breadcrumb-example';
import { TopBarBreadcrumbsExample } from './top-bar-breadcrumbs/top-bar-breadcrumbs-example';
import { TopBarOverflowExample } from './top-bar-overflow/top-bar-overflow-example';
import { TopBarOverviewExample } from './top-bar-overview/top-bar-overview-example';
import { TopBarSecondaryActionsResponsiveExample } from './top-bar-secondary-actions-responsive/top-bar-secondary-actions-responsive-example';
import { TopBarSecondaryActionsExample } from './top-bar-secondary-actions/top-bar-secondary-actions-example';

export {
    TopBarActiveBreadcrumbExample,
    TopBarBreadcrumbsExample,
    TopBarOverflowExample,
    TopBarOverviewExample,
    TopBarSecondaryActionsExample,
    TopBarSecondaryActionsResponsiveExample
};

const EXAMPLES = [
    TopBarOverviewExample,
    TopBarOverflowExample,
    TopBarBreadcrumbsExample,
    TopBarActiveBreadcrumbExample,
    TopBarSecondaryActionsExample,
    TopBarSecondaryActionsResponsiveExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TopBarExamplesModule {}
