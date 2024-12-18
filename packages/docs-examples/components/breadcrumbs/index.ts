import { NgModule } from '@angular/core';
import { BreadcrumbOverviewExample } from './breadcrumb-overview/breadcrumb-overview-example';
import { BreadcrumbSizesExample } from './breadcrumbs-sizes/breadcrumb-sizes-example';

export { BreadcrumbOverviewExample, BreadcrumbSizesExample };

const EXAMPLES = [
    BreadcrumbOverviewExample,
    BreadcrumbSizesExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
