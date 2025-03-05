import { NgModule } from '@angular/core';
import { BreadcrumbsCustomTemplateExample } from './breadcrumbs-custom-template/breadcrumbs-custom-template-example';
import { BreadcrumbsDropdownExample } from './breadcrumbs-dropdown/breadcrumbs-dropdown-example';
import { BreadcrumbsOverviewExample } from './breadcrumbs-overview/breadcrumbs-overview-example';
import { BreadcrumbsRoutingExample } from './breadcrumbs-routing/breadcrumbs-routing-example';
import { BreadcrumbsSizeExample } from './breadcrumbs-size/breadcrumbs-size-example';
import { BreadcrumbsTruncateByAbbrevItemsExample } from './breadcrumbs-truncate-by-abbrev-items/breadcrumbs-truncate-by-abbrev-items-example';
import { BreadcrumbsTruncateCenterItemsExample } from './breadcrumbs-truncate-center-items/breadcrumbs-truncate-center-items-example';
import { BreadcrumbsTruncateHeadItemsExample } from './breadcrumbs-truncate-head-items/breadcrumbs-truncate-head-items-example';
import { BreadcrumbsTruncateTailItemsExample } from './breadcrumbs-truncate-tail-items/breadcrumbs-truncate-tail-items-example';
import { BreadcrumbsWrapExample } from './breadcrumbs-wrap/breadcrumbs-wrap-example';

export {
    BreadcrumbsCustomTemplateExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsOverviewExample,
    BreadcrumbsRoutingExample,
    BreadcrumbsSizeExample,
    BreadcrumbsTruncateByAbbrevItemsExample,
    BreadcrumbsTruncateCenterItemsExample,
    BreadcrumbsTruncateHeadItemsExample,
    BreadcrumbsTruncateTailItemsExample,
    BreadcrumbsWrapExample
};

const EXAMPLES = [
    BreadcrumbsCustomTemplateExample,
    BreadcrumbsDropdownExample,
    BreadcrumbsOverviewExample,
    BreadcrumbsRoutingExample,
    BreadcrumbsSizeExample,
    BreadcrumbsTruncateByAbbrevItemsExample,
    BreadcrumbsTruncateCenterItemsExample,
    BreadcrumbsTruncateHeadItemsExample,
    BreadcrumbsTruncateTailItemsExample,
    BreadcrumbsWrapExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
