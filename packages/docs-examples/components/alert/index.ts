import { NgModule } from '@angular/core';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
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
    imports: [
        KbqIconModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqAlertModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class AlertExamplesModule {}
