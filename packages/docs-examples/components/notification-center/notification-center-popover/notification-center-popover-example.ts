import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule, PopUpPlacements, ThemeService } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqNotificationCenterModule, KbqNotificationCenterService } from '@koobiq/components/notification-center';
import { KbqToastStyle } from '@koobiq/components/toast';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon?: string;
    text?: string;
    action?: () => void;
    style: KbqButtonStyles | string;
    color: KbqComponentColors;
};

enum NavbarIcItems {
    Assets,
    Issues,
    Incidents,
    Policies,
    Security
}

/**
 * @title notification-center-popover
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'notification-center-popover-example',
    templateUrl: 'notification-center-popover-example.html',
    imports: [
        KbqNotificationCenterModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqEmptyStateModule,
        KbqTopBarModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqNavbarModule,
        AsyncPipe,
        KbqDividerModule,
        KbqLuxonDateModule,
        KbqFormattersModule
    ]
})
export class NotificationCenterPopoverExample {
    notificationService = inject(KbqNotificationCenterService);

    popUpPlacements = PopUpPlacements;

    protected readonly currentTheme = toSignal(
        inject(ThemeService, { optional: true })?.current.pipe(
            map((theme) => theme && theme.className.replace('kbq-', ''))
        ) || of('light'),
        { initialValue: 'light' }
    );

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `assets/images/${currentTheme}/empty_192.png 1x, assets/images/${currentTheme}/empty_192@2x.png 2x`;
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

    protected readonly actions: ExampleAction[] = [
        {
            id: '1',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Filled,
            text: 'Primary Action'
        },
        {
            id: '2',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent,
            icon: 'kbq-ellipsis-horizontal_16'
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;

    constructor() {
        this.notificationService.items = [
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
    }
}
