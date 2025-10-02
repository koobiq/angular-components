import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqNotificationCenterModule } from '@koobiq/components/notification-center';
import { NotificationCenterExamplesModule } from '../../docs-examples/components/notification-center';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [NotificationCenterExamplesModule],
    selector: 'dev-examples',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        DevExamples,
        DevThemeToggle,
        KbqButtonModule,
        KbqNotificationCenterModule,
        KbqIcon
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
