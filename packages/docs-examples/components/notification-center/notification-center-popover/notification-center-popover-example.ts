import { ChangeDetectionStrategy, Component, effect, inject, TemplateRef, viewChild } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqNotificationCenterModule, KbqNotificationCenterService } from '@koobiq/components/notification-center';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { createNotifications } from '../create-notifications';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title notification-center-popover
 */
@Component({
    selector: 'notification-center-popover-example',
    imports: [
        KbqNotificationCenterModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqNavbarModule,
        KbqLink,
        LuxonDateModule,
        KbqFormattersModule
    ],
    templateUrl: 'notification-center-popover-example.html',
    styles: `
        :host {
            display: block;
            min-height: 480px;
        }
    `,
    providers: [
        { provide: KbqNotificationCenterService, useClass: KbqNotificationCenterService }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterPopoverExample extends BaseLocalizedExample<ExampleTranslation> {
    notificationService = inject(KbqNotificationCenterService);

    private readonly actionsTemplate = viewChild<TemplateRef<unknown>>('actionsTemplate');

    constructor() {
        super(TRANSLATIONS);
        // Rebuilt on a locale switch to follow the language; the stable ids keep the read state.
        effect(() => {
            const actions = this.actionsTemplate();

            if (!actions) return;

            this.notificationService.items = createNotifications(
                this.t().list,
                { actions },
                this.notificationService.items
            );
        });
    }
}
