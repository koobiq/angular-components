import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule, ThemeService } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import {
    KbqNotificationCenterModule,
    KbqNotificationCenterService,
    KbqNotificationItem
} from '@koobiq/components/notification-center';
import { KbqToastStyle } from '@koobiq/components/toast';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { of, timer } from 'rxjs';
import { map } from 'rxjs/operators';

/** Items per loaded page. */
const PAGE_SIZE = 20;
/** Total number of pages the fake backend can serve. */
const TOTAL_PAGES = 5;
/** Simulated network latency, ms. */
const LOAD_DELAY = 800;
/** Fixed base date so generated notifications group by day deterministically. */
const BASE_DATE = Date.parse('2025-10-08T12:00:00Z');

const STYLES = [KbqToastStyle.Success, KbqToastStyle.Warning, KbqToastStyle.Error, KbqToastStyle.Contrast];

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
 * @title notification-center-infinite-scroll
 */
@Component({
    selector: 'notification-center-infinite-scroll-example',
    imports: [
        KbqNotificationCenterModule,
        KbqButtonModule,
        KbqIconModule,
        KbqBadgeModule,
        AsyncPipe,
        LuxonDateModule,
        KbqFormattersModule,
        KbqDropdownModule,
        KbqEmptyStateModule,
        KbqLink,
        KbqNavbarModule,
        KbqTopBarModule
    ],
    templateUrl: 'notification-center-infinite-scroll-example.html',
    providers: [{ provide: KbqNotificationCenterService, useClass: KbqNotificationCenterService }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCenterInfiniteScrollExample {
    protected readonly notificationService = inject(KbqNotificationCenterService);

    private readonly destroyRef = inject(DestroyRef);

    /** Index of the last loaded page. */
    private currentPage = 0;
    /** Used to demonstrate the bottom error state once, then succeed on retry. */
    private hasFailedOnce = false;

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

    protected items = NavbarIcItems;
    protected selected: NavbarIcItems = NavbarIcItems.Assets;

    constructor() {
        // Initial page loads immediately; subsequent pages are appended on scroll.
        this.appendPage(this.currentPage + 1);

        this.notificationService.onNextPage
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.appendPage(this.currentPage + 1));
    }

    private appendPage(page: number): void {
        if (this.notificationService.loadingMore.value || !this.notificationService.hasMore.value) {
            return;
        }

        this.notificationService.setLoadMoreErrorMode(false);
        this.notificationService.setLoadingMore(true);

        // Replace with a real paginated request in production.
        timer(LOAD_DELAY)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // Fail once on page 3 to showcase the bottom "load more" error + retry.
                if (page === 3 && !this.hasFailedOnce) {
                    this.hasFailedOnce = true;

                    this.notificationService.setLoadingMore(false);
                    this.notificationService.setLoadMoreErrorMode(true);

                    return;
                }

                this.currentPage = page;
                this.notificationService.items = [...this.notificationService.items, ...this.createPage(page)];
                this.notificationService.setHasMore(page < TOTAL_PAGES);
                this.notificationService.setLoadingMore(false);
            });
    }

    private createPage(page: number): KbqNotificationItem[] {
        return Array.from({ length: PAGE_SIZE }, (_, index) => {
            const globalIndex = (page - 1) * PAGE_SIZE + index;

            return {
                title: `Notification #${globalIndex + 1}`,
                caption: `Loaded with page ${page}`,
                icon: true,
                style: STYLES[globalIndex % STYLES.length],
                date: new Date(BASE_DATE - globalIndex * 3600_000).toISOString()
            };
        });
    }

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `https://koobiq.io/assets/images/${currentTheme}/empty_192.png 1x, assets/images/${currentTheme}/empty_192@2x.png 2x`;
    });

    protected readonly currentTheme = toSignal(
        inject(ThemeService, { optional: true })?.current.pipe(
            map((theme) => theme && theme.className.replace('kbq-', ''))
        ) || of('light'),
        { initialValue: 'light' }
    );

    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );
}
