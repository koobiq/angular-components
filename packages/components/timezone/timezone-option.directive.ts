import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, Directive, inject, input, OnDestroy } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subscription, throttleTime } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { KbqTimezoneOption } from './timezone-option.component';

/**
 * Rows of the city list an option shows before it clamps. Kept in step with the `-webkit-line-clamp` of
 * `.kbq-timezone-option__cities`.
 *
 * @docs-private
 */
export const TOOLTIP_VISIBLE_ROWS_COUNT = 3;

@Directive({
    selector: 'kbq-timezone-option',
    host: {
        '(mouseenter)': 'handleElementEnter()',
        '(mouseleave)': 'handleElementLeave()'
    }
})
export class KbqTimezoneOptionTooltip extends KbqTooltipTrigger implements AfterViewInit, OnDestroy {
    private readonly option = inject(KbqTimezoneOption);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);
    private readonly platform = inject(Platform);

    private readonly debounceInterval = 100;

    private resizeSubscription = Subscription.EMPTY;
    private contentObserverSubscription = Subscription.EMPTY;
    private focusMonitorSubscription = Subscription.EMPTY;

    /**
     * Overrides the tooltip's hoverable default. The overflow hint floats over the neighbouring options of a
     * scrolling list, so a pointer-capturing pane would swallow the click that selects them.
     */
    readonly ignoreTooltipPointerEvents = input<boolean>(true);

    constructor() {
        super();
        this.tooltipPlacement = PopUpPlacements.Right;
    }

    ngAfterViewInit(): void {
        if (!this.platform.isBrowser) return;

        super.ngAfterViewInit();

        const tooltipContentWrapper = this.option.tooltipContentWrapper();

        this.content = this.option.tooltipViewValue;
        this.checkTooltipDisabled();

        this.resizeSubscription = this.resizeObserver
            .observe(tooltipContentWrapper.nativeElement)
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(this.checkTooltipDisabled);

        this.contentObserverSubscription = this.contentObserver
            .observe(this.option.tooltipContent().nativeElement)
            .pipe(throttleTime(this.debounceInterval))
            .subscribe(() => {
                this.content = this.option.tooltipViewValue;
                this.checkTooltipDisabled();
            });

        this.focusMonitorSubscription = this.focusMonitor
            .monitor(this.elementRef)
            .subscribe((origin) => (origin === 'keyboard' ? this.handleElementEnter() : this.handleElementLeave()));
    }

    ngOnDestroy(): void {
        this.resizeSubscription.unsubscribe();
        this.contentObserverSubscription.unsubscribe();
        this.focusMonitorSubscription.unsubscribe();

        super.ngOnDestroy();
    }

    handleElementEnter(): void {
        // Re-read rather than trust the content observer: it is throttled, so a hover landing right after a
        // keystroke would otherwise open a hint listing the cities the search has just removed.
        this.content = this.option.tooltipViewValue;
        this.checkTooltipDisabled();
    }

    handleElementLeave(): void {
        this.disabled = true;
    }

    /**
     * Nothing in the option's template reads `disabled` — the tooltip is opened and closed imperatively — so
     * an unchanged measurement has nothing to re-render, and a resize frame over a long list would otherwise
     * cost one synchronous change-detection pass per option.
     */
    private checkTooltipDisabled = () => {
        if (!this.platform.isBrowser) return;

        const count: number = this.option.tooltipContent().nativeElement.getClientRects().length;
        const disabled: boolean = count <= TOOLTIP_VISIBLE_ROWS_COUNT;

        if (disabled === this.disabled) return;

        this.disabled = disabled;
    };
}
