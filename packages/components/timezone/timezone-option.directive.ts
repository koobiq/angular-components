import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { AfterViewInit, ChangeDetectorRef, Directive, inject, OnDestroy } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subscription } from 'rxjs';
import { KbqTimezoneOption } from './timezone-option.component';

export const TOOLTIP_VISIBLE_ROWS_COUNT = 3;

@Directive({
    selector: 'kbq-timezone-option',
    host: {
        '(mouseenter)': 'onMouseEnter()',
        '(mouseleave)': 'onMouseLeave()'
    }
})
export class KbqTimezoneOptionTooltip extends KbqTooltipTrigger implements AfterViewInit, OnDestroy {
    private resizeObserver = inject(SharedResizeObserver);
    private resizeObserverSubscription: Subscription | null = null;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private option: KbqTimezoneOption
    ) {
        super();
        this.tooltipPlacement = PopUpPlacements.Right;
    }

    ngAfterViewInit(): void {
        this.content = this.option.viewValue;
        this.option.tooltipContentWrapper.nativeElement.style.webkitLineClamp = TOOLTIP_VISIBLE_ROWS_COUNT.toString();
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.resizeObserverSubscription?.unsubscribe();
    }

    onMouseEnter(): void {
        this.resizeObserver
            .observe(this.option.tooltipContentWrapper.nativeElement)
            .subscribe(this.checkTooltipDisabled);

        this.checkTooltipDisabled();
    }

    onMouseLeave(): void {
        this.resizeObserverSubscription?.unsubscribe();

        this.disabled = true;
    }

    private checkTooltipDisabled = () => {
        const count: number = this.option.tooltipContent.nativeElement.getClientRects().length;

        this.disabled = count <= TOOLTIP_VISIBLE_ROWS_COUNT;

        this.changeDetectorRef.detectChanges();
    };
}
