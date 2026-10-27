import { BreakpointObserver } from '@angular/cdk/layout';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
    TemplateRef,
    viewChild
} from '@angular/core';
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
 * @title notification-center-error
 */
@Component({
    selector: 'notification-center-error-example',
    imports: [
        KbqNotificationCenterModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqEmptyStateModule,
        KbqTopBarModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqLink,
        LuxonDateModule,
        KbqFormattersModule,
        KbqNavbarModule
    ],
    templateUrl: 'notification-center-error-example.html',
    styles: `
        ::ng-deep .example-notification-center-panel {
            margin-top: -139px;
        }
    `,
    providers: [
        { provide: KbqNotificationCenterService, useClass: KbqNotificationCenterService }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterErrorExample {
    notificationService = inject(KbqNotificationCenterService);

    protected readonly text = injectExampleText();

    private readonly actionsTemplate = viewChild<TemplateRef<unknown>>('actionsTemplate');

    /** Whether the list was loaded with the reload button of the error state. */
    private readonly loaded = signal(false);

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
        this.notificationService.setErrorMode(true);

        this.notificationService.onReload.subscribe(() => {
            this.notificationService.setErrorMode(false);

            this.loaded.set(true);
        });

        // Built once the list is reloaded, and rebuilt on a locale switch to follow the language.
        effect(() => {
            const actions = this.actionsTemplate();

            if (!this.loaded() || !actions) return;

            this.notificationService.items = createNotifications(
                this.text(),
                { actions },
                this.notificationService.items
            );
        });
    }
}
