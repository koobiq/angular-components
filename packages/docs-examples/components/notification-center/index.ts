import { NgModule } from '@angular/core';
import { NotificationCenterOverviewExample } from './notification-center-overview/notification-center-overview-example';

export { NotificationCenterOverviewExample };

const EXAMPLES = [
    NotificationCenterOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NotificationCenterExamplesModule {}
