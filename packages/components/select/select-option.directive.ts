import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    Directive,
    ElementRef,
    Inject,
    NgZone,
    OnDestroy,
    Optional,
    ViewContainerRef
} from '@angular/core';
import { KbqOption } from '@koobiq/components/core';
import { KbqTooltipTrigger, KBQ_TOOLTIP_SCROLL_STRATEGY } from '@koobiq/components/tooltip';


@Directive({
    selector: 'kbq-option',
    host: {
        '(mouseenter)': 'onMouseEnter()',
        '(mouseleave)': 'onMouseLeave()',
        '(focus)': 'onFocus()',
        '(blur)': 'onBlur()'
    }
})
export class KbqOptionTooltip extends KbqTooltipTrigger implements AfterViewInit, OnDestroy {
    private resizeObserver: ResizeObserver;
    private mutationObserver: MutationObserver;

    get textElement(): HTMLElement {
        return this.option.textElement.nativeElement;
    }

    get isOverflown(): boolean {
        return this.textElement.clientWidth < this.textElement.scrollWidth;
    }

    constructor(
        private option: KbqOption,
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        focusMonitor: FocusMonitor
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction, focusMonitor);
    }

    ngAfterViewInit() {
        this.content = this.option.viewValue;

        this.resizeObserver = new ResizeObserver(() => this.disabled = !this.isOverflown);

        this.mutationObserver = new MutationObserver(() => this.content = this.option.viewValue);

        this.mutationObserver.observe(this.textElement, {
            characterData: true, attributes: false, childList: true, subtree: true
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.textElement);
            this.resizeObserver.disconnect();
        }

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }

    onMouseEnter() {
        this.resizeObserver.observe(this.textElement);

        this.disabled = !this.isOverflown;
    }

    onMouseLeave() {
        this.resizeObserver.unobserve(this.textElement);

        this.disabled = true;
    }

    onFocus() {
        this.disabled = !this.isOverflown;
        if (!this.disabled) {
            this.show();
        }
    }

    onBlur() {
        this.disabled = true;
        this.hide();
    }
}
