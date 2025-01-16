import { NgModule } from '@angular/core';
import { BreadcrumbsCustomTemplateExample } from './breadcrumbs-custom-template/breadcrumbs-custom-template-example';
import { BreadcrumbsDropdownExample } from './breadcrumbs-dropdown/breadcrumbs-dropdown-example';
import { BreadcrumbsOverviewExample } from './breadcrumbs-overview/breadcrumbs-overview-example';
import { BreadcrumbsSizeExample } from './breadcrumbs-size/breadcrumbs-size-example';
import { BreadcrumbsTruncateByAbbrevItemsExample } from './breadcrumbs-truncate-by-abbrev-items/breadcrumbs-truncate-by-abbrev-items-example';
import { BreadcrumbsTruncateHeadItemsExample } from './breadcrumbs-truncate-head-items/breadcrumbs-truncate-head-items-example';
import { BreadcrumbsTruncateTailItemsExample } from './breadcrumbs-truncate-tail-items/breadcrumbs-truncate-tail-items-example';

export {
    BreadcrumbsCustomTemplateExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample,
    BreadcrumbsTruncateByAbbrevItemsExample,
    BreadcrumbsTruncateHeadItemsExample,
    BreadcrumbsTruncateTailItemsExample
};

const EXAMPLES = [
    BreadcrumbsOverviewExample,
    BreadcrumbsSizeExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsCustomTemplateExample,
    BreadcrumbsTruncateHeadItemsExample,
    BreadcrumbsTruncateTailItemsExample,
    BreadcrumbsTruncateByAbbrevItemsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
