import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqToastStyle } from '@koobiq/components/toast';
import { KbqNotificationCenterModule } from './notification-center.module';
import { KbqNotificationCenterService } from './notification-center.service';

@Component({
    selector: 'e2e-notification-center-states',
    imports: [KbqNotificationCenterModule, KbqLuxonDateModule, KbqFormattersModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="height: 700px; width: 405px">
            <kbq-notification-center style="max-height: 100%" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNotificationCenterStates'
    }
})
export class E2eNotificationCenterStates {
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
        }
    ];

    constructor() {
        this.notificationService.items = this.items;
    }
}
