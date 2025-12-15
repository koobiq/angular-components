import { NgModule } from '@angular/core';
import { NotificationCenterEmptyExample } from './notification-center-empty/notification-center-empty-example';
import { NotificationCenterErrorExample } from './notification-center-error/notification-center-error-example';
import { NotificationCenterOverviewExample } from './notification-center-overview/notification-center-overview-example';
import { NotificationCenterPopoverExample } from './notification-center-popover/notification-center-popover-example';
import { NotificationCenterPushExample } from './notification-center-push/notification-center-push-example';

export {
    NotificationCenterEmptyExample,
    NotificationCenterErrorExample,
    NotificationCenterOverviewExample,
    NotificationCenterPopoverExample,
    NotificationCenterPushExample
};

const EXAMPLES = [
    NotificationCenterOverviewExample,
    NotificationCenterEmptyExample,
    NotificationCenterErrorExample,
    NotificationCenterPopoverExample,
    NotificationCenterPushExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NotificationCenterExamplesModule {}
