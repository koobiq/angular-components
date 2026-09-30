import { NgModule } from '@angular/core';
import { SkeletonAccordionExample } from './skeleton-accordion/skeleton-accordion-example';
import { SkeletonCheckableExample } from './skeleton-checkable/skeleton-checkable-example';
import { SkeletonCodeBlockExample } from './skeleton-code-block/skeleton-code-block-example';
import { SkeletonDlExample } from './skeleton-dl/skeleton-dl-example';
import { SkeletonElementsExample } from './skeleton-elements/skeleton-elements-example';
import { SkeletonFormFieldExample } from './skeleton-form-field/skeleton-form-field-example';
import { SkeletonGridExample } from './skeleton-grid/skeleton-grid-example';
import { SkeletonGroupExample } from './skeleton-group/skeleton-group-example';
import { SkeletonInSidepanelExample } from './skeleton-in-sidepanel/skeleton-in-sidepanel-example';
import { SkeletonOverviewExample } from './skeleton-overview/skeleton-overview-example';
import { SkeletonTableExample } from './skeleton-table/skeleton-table-example';
import { SkeletonTabsExample } from './skeleton-tabs/skeleton-tabs-example';
import { SkeletonTreeExample } from './skeleton-tree/skeleton-tree-example';
import { SkeletonTypographyExample } from './skeleton-typography/skeleton-typography-example';

export {
    SkeletonAccordionExample,
    SkeletonCheckableExample,
    SkeletonCodeBlockExample,
    SkeletonDlExample,
    SkeletonElementsExample,
    SkeletonFormFieldExample,
    SkeletonGridExample,
    SkeletonGroupExample,
    SkeletonInSidepanelExample,
    SkeletonOverviewExample,
    SkeletonTableExample,
    SkeletonTabsExample,
    SkeletonTreeExample,
    SkeletonTypographyExample
};

const EXAMPLES = [
    SkeletonOverviewExample,
    SkeletonElementsExample,
    SkeletonTypographyExample,
    SkeletonDlExample,
    SkeletonTableExample,
    SkeletonGridExample,
    SkeletonGroupExample,
    SkeletonFormFieldExample,
    SkeletonAccordionExample,
    SkeletonCheckableExample,
    SkeletonTabsExample,
    SkeletonTreeExample,
    SkeletonCodeBlockExample,
    SkeletonInSidepanelExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SkeletonExamplesModule {}
