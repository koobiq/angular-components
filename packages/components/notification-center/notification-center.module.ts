import { NgModule } from '@angular/core';
import { KbqNotificationCenterComponent, KbqNotificationCenterTrigger } from './notification-center';

/**
 * Compatibility wrapper around the standalone notification center. Importing
 * `KbqNotificationCenterTrigger` directly is equivalent.
 */
@NgModule({
    imports: [
        KbqNotificationCenterComponent,
        KbqNotificationCenterTrigger
    ],
    exports: [
        KbqNotificationCenterComponent,
        KbqNotificationCenterTrigger
    ]
})
export class KbqNotificationCenterModule {}
