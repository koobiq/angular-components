import { NgModule } from '@angular/core';
import { BreadcrumbsCustomTemplateExample } from './breadcrumbs-custom-template/breadcrumbs-custom-template-example';
import { BreadcrumbsDropdownExample } from './breadcrumbs-dropdown/breadcrumbs-dropdown-example';
import { BreadcrumbsOverviewExample } from './breadcrumbs-overview/breadcrumbs-overview-example';
import { BreadcrumbsSizeExample } from './breadcrumbs-size/breadcrumbs-size-example';

export {
    BreadcrumbsCustomTemplateExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample
};

const EXAMPLES = [
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsCustomTemplateExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
