import { NgModule } from '@angular/core';
import { TopMenuActiveBreadcrumbExample } from './top-menu-active-breadcrumb/top-menu-active-breadcrumb-example';
import { TopMenuBreadcrumbsExample } from './top-menu-breadcrumbs/top-menu-breadcrumbs-example';
import { TopMenuOverflowExample } from './top-menu-overflow/top-menu-overflow-example';
import { TopMenuOverviewExample } from './top-menu-overview/top-menu-overview-example';
import { TopMenuSecondaryActions } from './top-menu-secondary-actions/top-menu-secondary-actions';

export {
    TopMenuActiveBreadcrumbExample,
    TopMenuBreadcrumbsExample,
    TopMenuOverflowExample,
    TopMenuOverviewExample,
    TopMenuSecondaryActions
};

const EXAMPLES = [
    TopMenuOverviewExample,
    TopMenuOverflowExample,
    TopMenuBreadcrumbsExample,
    TopMenuActiveBreadcrumbExample,
    TopMenuSecondaryActions
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TopMenuExamplesModule {}
