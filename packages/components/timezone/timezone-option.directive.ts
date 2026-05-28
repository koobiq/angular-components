import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { AfterViewInit, ChangeDetectorRef, Directive, inject, OnDestroy } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subscription, throttleTime } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { KbqTimezoneOption } from './timezone-option.component';

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
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);

    private readonly debounceInterval = 100;

    private resizeSubscription = Subscription.EMPTY;
    private contentObserverSubscription = Subscription.EMPTY;
    private focusMonitorSubscription = Subscription.EMPTY;

    constructor() {
        super();
        this.tooltipPlacement = PopUpPlacements.Right;
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();

        const tooltipContentWrapper = this.option.tooltipContentWrapper();

        this.content = this.option.viewValue;
        tooltipContentWrapper.nativeElement.style.webkitLineClamp = TOOLTIP_VISIBLE_ROWS_COUNT.toString();
        this.checkTooltipDisabled();

        this.resizeSubscription = this.resizeObserver
            .observe(tooltipContentWrapper.nativeElement)
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(this.checkTooltipDisabled);

        this.contentObserverSubscription = this.contentObserver
            .observe(this.option.tooltipContent().nativeElement)
            .pipe(throttleTime(this.debounceInterval))
            .subscribe(() => {
                this.content = this.option.viewValue;
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
        this.checkTooltipDisabled();
    }

    handleElementLeave(): void {
        this.disabled = true;
    }

    private checkTooltipDisabled = () => {
        const count: number = this.option.tooltipContent().nativeElement.getClientRects().length;

        this.disabled = count <= TOOLTIP_VISIBLE_ROWS_COUNT;

        this.changeDetectorRef.detectChanges();
    };
}
