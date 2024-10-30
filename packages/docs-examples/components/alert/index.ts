import { NgModule } from '@angular/core';
import { AlertCloseExample } from './alert-close/alert-close-example';
import { AlertContentExample } from './alert-content/alert-content-example';
import { AlertSizeExample } from './alert-size/alert-size-example';
import { AlertStatusExample } from './alert-status/alert-status-example';
import { AlertVariantsExample } from './alert-variants/alert-variants-example';

export { AlertCloseExample, AlertContentExample, AlertSizeExample, AlertStatusExample, AlertVariantsExample };

const EXAMPLES = [
    AlertCloseExample,
    AlertContentExample,
    AlertSizeExample,
    AlertStatusExample,
    AlertVariantsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AlertExamplesModule {}
