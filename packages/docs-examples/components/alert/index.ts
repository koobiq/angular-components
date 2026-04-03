import { NgModule } from '@angular/core';
import { AlertCloseExample } from './alert-close/alert-close-example';
import { AlertContentExample } from './alert-content/alert-content-example';
import { AlertOverviewExample } from './alert-overview/alert-overview-example';
import { AlertStatusExample } from './alert-status/alert-status-example';
import { AlertVariantsExample } from './alert-variants/alert-variants-example';

export { AlertCloseExample, AlertContentExample, AlertOverviewExample, AlertStatusExample, AlertVariantsExample };

const EXAMPLES = [
    AlertCloseExample,
    AlertContentExample,
    AlertOverviewExample,
    AlertStatusExample,
    AlertVariantsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AlertExamplesModule {}
