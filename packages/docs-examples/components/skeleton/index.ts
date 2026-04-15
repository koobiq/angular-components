import { NgModule } from '@angular/core';
import { SkeletonDirectiveExample } from './skeleton-directive/skeleton-directive-example';
import { SkeletonInSidepanelExample } from './skeleton-in-sidepanel/skeleton-in-sidepanel-example';
import { SkeletonOverviewExample } from './skeleton-overview/skeleton-overview-example';

export { SkeletonDirectiveExample, SkeletonInSidepanelExample, SkeletonOverviewExample };

const EXAMPLES = [SkeletonOverviewExample, SkeletonInSidepanelExample, SkeletonDirectiveExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SkeletonExamplesModule {}
