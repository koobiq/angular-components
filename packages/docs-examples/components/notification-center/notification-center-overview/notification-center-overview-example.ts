import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * @title notification-center
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'notification-center-overview-example',
    imports: [
        ReactiveFormsModule
    ],
    template: ``
})
export class NotificationCenterOverviewExample {}
