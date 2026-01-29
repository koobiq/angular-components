import { NgModule } from '@angular/core';
import { SkeletonInSidepanelExample } from './skeleton-in-sidepanel/skeleton-in-sidepanel-example';
import { SkeletonOverviewExample } from './skeleton-overview/skeleton-overview-example';

export { SkeletonInSidepanelExample, SkeletonOverviewExample };

const EXAMPLES = [SkeletonOverviewExample, SkeletonInSidepanelExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SkeletonExamplesModule {}
