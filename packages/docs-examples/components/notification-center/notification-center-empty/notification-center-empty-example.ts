import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule, PopUpPlacements, ThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqNotificationCenterModule, KbqNotificationCenterService } from '@koobiq/components/notification-center';
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
 * @title notification-center-empty
 */
@Component({
    selector: 'notification-center-empty-example',
    imports: [
        KbqNotificationCenterModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqEmptyStateModule,
        KbqTopBarModule,
        KbqButtonModule,
        KbqDropdownModule,
        AsyncPipe,
        LuxonDateModule,
        KbqFormattersModule,
        KbqNavbarModule
    ],
    templateUrl: 'notification-center-empty-example.html',
    styles: `
        ::ng-deep .example-notification-center-panel {
            margin-top: -139px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: KbqNotificationCenterService, useClass: KbqNotificationCenterService }]
})
export class NotificationCenterEmptyExample {
    readonly notificationService = inject(KbqNotificationCenterService);

    protected readonly currentTheme = toSignal(
        inject(ThemeService, { optional: true })?.current.pipe(
            map((theme) => theme && theme.className.replace('kbq-', ''))
        ) || of('light'),
        { initialValue: 'light' }
    );

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `https://koobiq.io/assets/images/${currentTheme}/empty_192.png 1x, assets/images/${currentTheme}/empty_192@2x.png 2x`;
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
}
