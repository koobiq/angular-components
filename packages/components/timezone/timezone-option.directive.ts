import { AfterViewInit, ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
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
    private resizeObserver: ResizeObserver;

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

        this.resizeObserver = new ResizeObserver(() => this.checkTooltipDisabled());
        this.resizeObserver.observe(this.option.tooltipContentWrapper.nativeElement);
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
        this.resizeObserver?.unobserve(this.option.tooltipContentWrapper.nativeElement);
    }

    onMouseEnter(): void {
        this.resizeObserver.observe(this.option.tooltipContentWrapper.nativeElement);
        this.checkTooltipDisabled();
    }

    onMouseLeave(): void {
        this.resizeObserver.unobserve(this.option.tooltipContentWrapper.nativeElement);

        this.disabled = true;
    }

    private checkTooltipDisabled(): void {
        const count: number = this.option.tooltipContent.nativeElement.getClientRects().length;

        this.disabled = count <= TOOLTIP_VISIBLE_ROWS_COUNT;

        this.changeDetectorRef.detectChanges();
    }
}
