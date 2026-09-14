import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqToastStyle } from '@koobiq/components/toast';
import { KbqNotificationCenterModule } from './notification-center.module';
import { KbqNotificationCenterService, KbqNotificationItem } from './notification-center.service';

/** Fresh copies of the demo list, so a fixture that mutates an item cannot affect the next one. */
const createE2eNotificationItems = (): KbqNotificationItem[] => [
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

    items = createE2eNotificationItems();

    constructor() {
        this.notificationService.items = this.items;
    }
}

/** The panel with nothing to show. */
@Component({
    selector: 'e2e-notification-center-empty',
    imports: [KbqNotificationCenterModule, KbqLuxonDateModule, KbqFormattersModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="height: 700px; width: 405px">
            <kbq-notification-center style="max-height: 100%" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNotificationCenterEmpty'
    }
})
export class E2eNotificationCenterEmpty {
    constructor() {
        inject(KbqNotificationCenterService).items = [];
    }
}

/** The full-screen loader that replaces the list while the first page is loading. */
@Component({
    selector: 'e2e-notification-center-loading',
    imports: [KbqNotificationCenterModule, KbqLuxonDateModule, KbqFormattersModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="height: 700px; width: 405px">
            <kbq-notification-center style="max-height: 100%" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNotificationCenterLoading'
    }
})
export class E2eNotificationCenterLoading {
    constructor() {
        inject(KbqNotificationCenterService).setLoadingMode(true);
    }
}

/** The full-screen error state that replaces the list when the first page failed to load. */
@Component({
    selector: 'e2e-notification-center-error',
    imports: [KbqNotificationCenterModule, KbqLuxonDateModule, KbqFormattersModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="height: 700px; width: 405px">
            <kbq-notification-center style="max-height: 100%" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNotificationCenterError'
    }
})
export class E2eNotificationCenterError {
    constructor() {
        inject(KbqNotificationCenterService).setErrorMode(true);
    }
}

/** The bottom row shown while the next page is being loaded. */
@Component({
    selector: 'e2e-notification-center-load-more',
    imports: [KbqNotificationCenterModule, KbqLuxonDateModule, KbqFormattersModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="height: 700px; width: 405px">
            <kbq-notification-center style="max-height: 100%" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNotificationCenterLoadMore'
    }
})
export class E2eNotificationCenterLoadMore {
    constructor() {
        const service = inject(KbqNotificationCenterService);

        service.items = createE2eNotificationItems();
        service.setLoadingMore(true);
    }
}

/** The bottom row shown when the next page failed to load, with its retry button. */
@Component({
    selector: 'e2e-notification-center-load-more-error',
    imports: [KbqNotificationCenterModule, KbqLuxonDateModule, KbqFormattersModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="height: 700px; width: 405px">
            <kbq-notification-center style="max-height: 100%" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNotificationCenterLoadMoreError'
    }
})
export class E2eNotificationCenterLoadMoreError {
    constructor() {
        const service = inject(KbqNotificationCenterService);

        service.items = createE2eNotificationItems();
        service.setLoadMoreErrorMode(true);
    }
}

/**
 * The panel as consumers actually open it — through a trigger, into an overlay. The only fixture where
 * the focus trap, the trigger's `aria-expanded`, the keyboard-reachable delete buttons and the Escape
 * handler are observable at all.
 */
@Component({
    selector: 'e2e-notification-center-trigger',
    imports: [KbqNotificationCenterModule, KbqLuxonDateModule, KbqFormattersModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="height: 700px; width: 700px">
            <button kbqNotificationCenterTrigger data-testid="e2eNotificationCenterTriggerButton" [popoverMode]="true">
                Open notifications
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNotificationCenterTrigger'
    }
})
export class E2eNotificationCenterTrigger {
    constructor() {
        inject(KbqNotificationCenterService).items = createE2eNotificationItems();
    }
}
