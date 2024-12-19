import { NgModule } from '@angular/core';
import { BreadcrumbsDropdownExample } from './breadcrumbs-dropdown/breadcrumbs-dropdown-example';
import { BreadcrumbsOverviewExample } from './breadcrumbs-overview/breadcrumbs-overview-example';
import { BreadcrumbsSizeExample } from './breadcrumbs-size/breadcrumbs-size-example';

export { BreadcrumbsDropdownExample, BreadcrumbsOverviewExample, BreadcrumbsSizeExample };

const EXAMPLES = [
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample,
    BreadcrumbsDropdownExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
