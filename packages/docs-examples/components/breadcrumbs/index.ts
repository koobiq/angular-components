import { NgModule } from '@angular/core';
import { BreadcrumbsCustomTemplateExample } from './breadcrumbs-custom-template/breadcrumbs-custom-template-example';
import { BreadcrumbsDropdownExample } from './breadcrumbs-dropdown/breadcrumbs-dropdown-example';
import { BreadcrumbsOverviewExample } from './breadcrumbs-overview/breadcrumbs-overview-example';
import { BreadcrumbsSizeExample } from './breadcrumbs-size/breadcrumbs-size-example';
import { BreadcrumbsTruncateItemsExample } from './breadcrumbs-truncate-items/breadcrumbs-truncate-items-example';

export {
    BreadcrumbsCustomTemplateExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample,
    BreadcrumbsTruncateItemsExample
};

const EXAMPLES = [
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsCustomTemplateExample,
    BreadcrumbsTruncateItemsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
