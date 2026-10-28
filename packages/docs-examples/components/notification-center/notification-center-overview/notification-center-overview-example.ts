import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, effect, inject, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonColor, KbqButtonModule, KbqButtonStyleInput, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule, KbqThemeService, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqNotificationCenterModule, KbqNotificationCenterService } from '@koobiq/components/notification-center';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';
import { createNotifications, injectExampleText } from '../localized-data';

type ExampleAction = {
    id: string;
    icon?: string;
    text?: string;
    action?: () => void;
    style: KbqButtonStyleInput;
    color: KbqButtonColor;
};

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
    selector: 'notification-center-overview-example',
    imports: [
        KbqNotificationCenterModule,
        KbqNavbarModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqEmptyStateModule,
        KbqTopBarModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqLink,
        LuxonDateModule,
        KbqFormattersModule
    ],
    templateUrl: 'notification-center-overview-example.html',
    styles: `
        ::ng-deep .example-notification-center-panel {
            margin-top: -139px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterOverviewExample {
    notificationService = inject(KbqNotificationCenterService);

    protected readonly text = injectExampleText();

    private readonly actionsTemplate = viewChild<TemplateRef<unknown>>('actionsTemplate');
    private readonly captionTemplate = viewChild<TemplateRef<unknown>>('captionTemplate');

    private readonly themeService = inject(KbqThemeService, { optional: true });
    protected readonly currentTheme = computed(() => this.themeService?.colorScheme() ?? 'light');

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `assets/images/${currentTheme}/empty_192.webp 1x, assets/images/${currentTheme}/empty_192@2x.webp 2x`;
    });

    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    protected items = NavbarIcItems;
    protected selected: NavbarIcItems = NavbarIcItems.Assets;

    protected readonly actions = computed<ExampleAction[]>(() => [
        {
            id: '1',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Filled,
            text: this.text().primaryAction
        },
        {
            id: '2',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent,
            icon: 'kbq-ellipsis-horizontal_16'
        }
    ]);

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;

    constructor() {
        // Rebuilt on a locale switch to follow the language; the stable ids keep the read state.
        effect(() => {
            const actions = this.actionsTemplate();

            if (!actions) return;

            this.notificationService.items = createNotifications(
                this.text(),
                { actions, caption: this.captionTemplate() },
                this.notificationService.items
            );
        });
    }

    protected readonly popUpPlacements = PopUpPlacements;
}
