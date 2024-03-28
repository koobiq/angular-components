import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

import { AlertsOverviewExample } from './alerts-overview/alerts-overview-example';


export {
    AlertsOverviewExample
};

const EXAMPLES = [
    AlertsOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqIconModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqAlertModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class AlertsExamplesModule {
}
