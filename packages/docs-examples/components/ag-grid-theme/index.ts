import { NgModule } from '@angular/core';
import { AgGridThemeOverviewExample } from './ag-grid-theme-overview/ag-grid-theme-overview-example';

export { AgGridThemeOverviewExample };

const EXAMPLES = [
    AgGridThemeOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AgGridThemeExamplesModule {}
