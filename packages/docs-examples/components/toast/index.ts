import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqToastModule } from '@koobiq/components/toast';

import { ToastActionsOverviewExample } from './toast-actions-overview/toast-actions-overview-example';
import { ToastLinkOverviewExample } from './toast-link-overview/toast-link-overview-example';
import { ToastOverviewExample } from './toast-overview/toast-overview-example';
import { ToastProgressBarOverviewExample } from './toast-progress-bar-overview/toast-progress-bar-overview-example';
import { ToastReportOverviewExample } from './toast-report-overview/toast-report-overview-example';
import { ToastTypesOverviewExample } from './toast-types-overview/toast-types-overview-example';
import { ToastHideOverviewExample } from './toast-hide-overview/toast-hide-overview-example';


export {
    ToastOverviewExample,
    ToastActionsOverviewExample,
    ToastLinkOverviewExample,
    ToastProgressBarOverviewExample,
    ToastReportOverviewExample,
    ToastTypesOverviewExample,
    ToastHideOverviewExample
};

const EXAMPLES = [
    ToastOverviewExample,
    ToastActionsOverviewExample,
    ToastLinkOverviewExample,
    ToastProgressBarOverviewExample,
    ToastReportOverviewExample,
    ToastTypesOverviewExample,
    ToastHideOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqProgressBarModule,
        KbqIconModule,
        KbqToastModule,
        KbqDropdownModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ToastExamplesModule {}
