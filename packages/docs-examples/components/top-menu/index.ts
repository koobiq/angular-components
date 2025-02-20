import { NgModule } from '@angular/core';
import { TopMenuActiveBreadcrumbExample } from './top-menu-active-breadcrumb/top-menu-active-breadcrumb-example';
import { TopMenuBreadcrumbsExample } from './top-menu-breadcrumbs/top-menu-breadcrumbs-example';
import { TopMenuOverflowExample } from './top-menu-overflow/top-menu-overflow-example';
import { TopMenuOverviewExample } from './top-menu-overview/top-menu-overview-example';
import { TopMenuSecondaryActionsResponsiveExample } from './top-menu-secondary-actions-responsive/top-menu-secondary-actions-responsive-example';
import { TopMenuSecondaryActionsExample } from './top-menu-secondary-actions/top-menu-secondary-actions-example';

export {
    TopMenuActiveBreadcrumbExample,
    TopMenuBreadcrumbsExample,
    TopMenuOverflowExample,
    TopMenuOverviewExample,
    TopMenuSecondaryActionsExample,
    TopMenuSecondaryActionsResponsiveExample
};

const EXAMPLES = [
    TopMenuOverviewExample,
    TopMenuOverflowExample,
    TopMenuBreadcrumbsExample,
    TopMenuActiveBreadcrumbExample,
    TopMenuSecondaryActionsExample,
    TopMenuSecondaryActionsResponsiveExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TopMenuExamplesModule {}
