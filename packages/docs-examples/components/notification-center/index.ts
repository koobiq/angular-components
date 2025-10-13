import { NgModule } from '@angular/core';
import { NotificationCenterEmptyExample } from './notification-center-empty/notification-center-empty-example';
import { NotificationCenterErrorExample } from './notification-center-error/notification-center-error-example';
import { NotificationCenterOverviewExample } from './notification-center-overview/notification-center-overview-example';
import { NotificationCenterPopoverExample } from './notification-center-popover/notification-center-popover-example';

export {
    NotificationCenterEmptyExample,
    NotificationCenterErrorExample,
    NotificationCenterOverviewExample,
    NotificationCenterPopoverExample
};

const EXAMPLES = [
    NotificationCenterOverviewExample,
    NotificationCenterEmptyExample,
    NotificationCenterErrorExample,
    NotificationCenterPopoverExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NotificationCenterExamplesModule {}
