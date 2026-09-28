import { NgModule } from '@angular/core';
import { SkeletonAlertExample } from './skeleton-alert/skeleton-alert-example';
import { SkeletonBadgeExample } from './skeleton-badge/skeleton-badge-example';
import { SkeletonButtonExample } from './skeleton-button/skeleton-button-example';
import { SkeletonDlExample } from './skeleton-dl/skeleton-dl-example';
import { SkeletonInSidepanelExample } from './skeleton-in-sidepanel/skeleton-in-sidepanel-example';
import { SkeletonListExample } from './skeleton-list/skeleton-list-example';
import { SkeletonOverviewExample } from './skeleton-overview/skeleton-overview-example';
import { SkeletonTableExample } from './skeleton-table/skeleton-table-example';
import { SkeletonTagExample } from './skeleton-tag/skeleton-tag-example';
import { SkeletonTreeExample } from './skeleton-tree/skeleton-tree-example';
import { SkeletonTypographyExample } from './skeleton-typography/skeleton-typography-example';

export {
    SkeletonAlertExample,
    SkeletonBadgeExample,
    SkeletonButtonExample,
    SkeletonDlExample,
    SkeletonInSidepanelExample,
    SkeletonListExample,
    SkeletonOverviewExample,
    SkeletonTableExample,
    SkeletonTagExample,
    SkeletonTreeExample,
    SkeletonTypographyExample
};

const EXAMPLES = [
    SkeletonOverviewExample,
    SkeletonInSidepanelExample,
    SkeletonButtonExample,
    SkeletonBadgeExample,
    SkeletonTagExample,
    SkeletonAlertExample,
    SkeletonDlExample,
    SkeletonTableExample,
    SkeletonTypographyExample,
    SkeletonListExample,
    SkeletonTreeExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SkeletonExamplesModule {}
