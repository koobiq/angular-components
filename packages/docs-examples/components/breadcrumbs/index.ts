import { NgModule } from '@angular/core';
import { BreadcrumbsOverviewExample } from './breadcrumbs-overview/breadcrumbs-overview-example';
import { BreadcrumbsSizeExample } from './breadcrumbs-size/breadcrumbs-size-example';

export { BreadcrumbsOverviewExample, BreadcrumbsSizeExample };

const EXAMPLES = [
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
