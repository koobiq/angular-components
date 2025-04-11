import { NgModule } from '@angular/core';
import { AgGridOverviewExample } from './ag-grid-overview/ag-grid-overview-example';

export { AgGridOverviewExample };

const EXAMPLES = [
    AgGridOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AgGridExamplesModule {}
