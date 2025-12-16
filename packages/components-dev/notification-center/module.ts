import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqNotificationCenterModule, KbqNotificationCenterService } from '@koobiq/components/notification-center';
import { KbqToastStyle } from '@koobiq/components/toast';
import { NotificationCenterExamplesModule } from '../../docs-examples/components/notification-center';

@Component({
    selector: 'dev-examples',
    imports: [NotificationCenterExamplesModule],
    template: `
        <notification-center-push-example />
        <br />
        <br />
        <notification-center-overview-example />
        <br />
        <br />
        <notification-center-empty-example />
        <br />
        <br />
        <notification-center-error-example />
        <br />
        <br />
        <notification-center-popover-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    selector: 'dev-app',
    imports: [
        DevExamples,
        KbqButtonModule,
        KbqNotificationCenterModule,
        KbqIcon,
        KbqLuxonDateModule,
        KbqFormattersModule
    ],
    templateUrl: './template.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    notificationService = inject(KbqNotificationCenterService);

    items = [
        {
            title: 'title_1, title_1, title_1, title_1, title_1, title_1, title_1, title_1, title_1, title_1',
            caption: 'caption_1, caption_1, caption_1, caption_1, caption_1, caption_1, caption_1, caption_1',
            icon: true,
            style: KbqToastStyle.Success,
            date: '2025-10-08T11:43:32.944Z'
        },
        {
            title: 'title_2',
            caption: 'caption_2',
            icon: true,
            style: KbqToastStyle.Warning,
            date: '2025-10-08T11:43:32.944Z'
        },
        {
            title: 'title_3',
            caption: 'caption_3',
            icon: true,
            style: KbqToastStyle.Contrast,
            date: '2025-10-08T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-08T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-07T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-07T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        },
        {
            title: 'title_4',
            caption: 'caption_4',
            icon: true,
            style: KbqToastStyle.Error,
            date: '2025-10-01T11:43:32.944Z'
        }
    ];

    constructor() {
        this.notificationService.items = this.items;
    }

    pushNotification() {
        this.notificationService.push({
            title: 'title_1, title_1, title_1, title_1, title_1, title_1, title_1, title_1, title_1, title_1',
            caption: 'caption_1, caption_1, caption_1, caption_1, caption_1, caption_1, caption_1, caption_1',
            icon: true,
            style: KbqToastStyle.Success,
            date: new Date().toISOString()
        });
    }
}
