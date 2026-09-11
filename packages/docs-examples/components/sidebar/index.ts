import { NgModule } from '@angular/core';
import { SidebarOverviewExample } from './sidebar-overview/sidebar-overview-example';
import { SidebarStateSavingExample } from './sidebar-state-saving/sidebar-state-saving-example';
import { SidebarWithSplitterExample } from './sidebar-with-splitter/sidebar-with-splitter-example';

export { SidebarOverviewExample, SidebarStateSavingExample, SidebarWithSplitterExample };

const EXAMPLES = [
    SidebarOverviewExample,
    SidebarStateSavingExample,
    SidebarWithSplitterExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class SidebarExamplesModule {}
