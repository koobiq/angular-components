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
import { BreadcrumbsWithAutoWrapAdaptiveExample } from './breadcrumbs-with-auto-wrap-adaptive/breadcrumbs-with-auto-wrap-adaptive-example';
import { BreadcrumbsWithWrapExample } from './breadcrumbs-with-wrap/breadcrumbs-with-wrap-example';

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
    BreadcrumbsWithAutoWrapAdaptiveExample,
    BreadcrumbsWithWrapExample
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
    BreadcrumbsWithWrapExample,
    BreadcrumbsWithAutoWrapAdaptiveExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class BreadcrumbsExamplesModule {}
