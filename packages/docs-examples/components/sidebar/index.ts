import { NgModule } from '@angular/core';
import { SidebarOverviewExample } from './sidebar-overview/sidebar-overview-example';
import { SidebarWithSplitterExample } from './sidebar-with-splitter/sidebar-with-splitter-example';

export { SidebarOverviewExample, SidebarWithSplitterExample };

const EXAMPLES = [
    SidebarOverviewExample,
    SidebarWithSplitterExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SidebarExamplesModule {}
