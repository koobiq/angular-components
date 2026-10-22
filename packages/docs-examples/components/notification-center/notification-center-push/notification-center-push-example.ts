import { ChangeDetectionStrategy, Component, effect, inject, TemplateRef, viewChild } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqNotificationCenterModule, KbqNotificationCenterService } from '@koobiq/components/notification-center';
import { KbqToastStyle } from '@koobiq/components/toast';
import { createNotifications, injectExampleText } from '../localized-data';

/** Id prefix of the notifications pushed with the button, so a locale switch can find them. */
const PUSHED_ID = 'pushed-';

let pushedCount = 0;

enum NavbarIcItems {
    Assets,
    Issues,
    Incidents,
    Policies,
    Security
}

/**
 * @title notification-center
 */
@Component({
    selector: 'notification-center-push-example',
    imports: [
        KbqNotificationCenterModule,
        KbqNavbarModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqLink,
        LuxonDateModule,
        KbqFormattersModule
    ],
    templateUrl: 'notification-center-push-example.html',
    styles: `
        ::ng-deep .example-notification-center-panel {
            margin-top: -139px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterPushExample {
    notificationService = inject(KbqNotificationCenterService);

    protected readonly text = injectExampleText();

    private readonly actionsTemplate = viewChild<TemplateRef<unknown>>('actionsTemplate');
    private readonly captionTemplate = viewChild<TemplateRef<unknown>>('captionTemplate');

    protected items = NavbarIcItems;
    protected selected: NavbarIcItems = NavbarIcItems.Assets;

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;

    constructor() {
        // Rebuilt on a locale switch to follow the language: the stable ids keep the read state, and the
        // notifications pushed with the button stay in the list.
        effect(() => {
            const text = this.text();
            const actions = this.actionsTemplate();

            if (!actions) return;

            const current = this.notificationService.items;
            const pushed = current
                .filter(({ id }) => id?.startsWith(PUSHED_ID))
                .map((item) => ({ ...item, title: text.pushedTitle, caption: text.pushedCaption }));

            this.notificationService.items = [
                ...createNotifications(text, { actions, caption: this.captionTemplate() }, current),
                ...pushed
            ];
        });
    }

    pushNotification() {
        const text = this.text();

        this.notificationService.push({
            id: `${PUSHED_ID}${++pushedCount}`,
            title: text.pushedTitle,
            caption: text.pushedCaption,
            icon: true,
            style: KbqToastStyle.Success,
            date: new Date().toISOString()
        });
    }
}
