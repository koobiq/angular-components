import { NgModule } from '@angular/core';

import { ToastActionsOverviewExample } from './toast-actions-overview/toast-actions-overview-example';
import { ToastHideOverviewExample } from './toast-hide-overview/toast-hide-overview-example';
import { ToastLinkOverviewExample } from './toast-link-overview/toast-link-overview-example';
import { ToastOverviewExample } from './toast-overview/toast-overview-example';
import { ToastProgressBarOverviewExample } from './toast-progress-bar-overview/toast-progress-bar-overview-example';
import { ToastReportOverviewExample } from './toast-report-overview/toast-report-overview-example';
import { ToastTypesOverviewExample } from './toast-types-overview/toast-types-overview-example';
import { ToastUserDataExample } from './toast-user-data/toast-user-data-example';

export {
    ToastActionsOverviewExample,
    ToastHideOverviewExample,
    ToastLinkOverviewExample,
    ToastOverviewExample,
    ToastProgressBarOverviewExample,
    ToastReportOverviewExample,
    ToastTypesOverviewExample,
    ToastUserDataExample
};

const EXAMPLES = [
    ToastOverviewExample,
    ToastActionsOverviewExample,
    ToastLinkOverviewExample,
    ToastProgressBarOverviewExample,
    ToastReportOverviewExample,
    ToastTypesOverviewExample,
    ToastHideOverviewExample,
    ToastUserDataExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ToastExamplesModule {}
