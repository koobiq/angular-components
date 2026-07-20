import { NgModule } from '@angular/core';
import { AlertCloseExample } from './alert-close/alert-close-example';
import { AlertContentExample } from './alert-content/alert-content-example';
import { AlertDynamicExample } from './alert-dynamic/alert-dynamic-example';
import { AlertOverviewExample } from './alert-overview/alert-overview-example';
import { AlertStatusExample } from './alert-status/alert-status-example';
import { AlertVariantsExample } from './alert-variants/alert-variants-example';

export {
    AlertCloseExample,
    AlertContentExample,
    AlertDynamicExample,
    AlertOverviewExample,
    AlertStatusExample,
    AlertVariantsExample
};

const EXAMPLES = [
    AlertCloseExample,
    AlertContentExample,
    AlertDynamicExample,
    AlertOverviewExample,
    AlertStatusExample,
    AlertVariantsExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AlertExamplesModule {}
