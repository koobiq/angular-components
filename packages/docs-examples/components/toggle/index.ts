import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';

export { ToggleOverviewExample };

const EXAMPLES = [
    ToggleOverviewExample,
];

@NgModule({
    imports: [
        FormsModule,
        KbqToggleModule,
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
})
export class ToggleExamplesModule {}
