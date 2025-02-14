import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { AfterViewInit, Directive, inject, OnDestroy } from '@angular/core';
import { KbqOption } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subscription } from 'rxjs';

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
    private resizeObserver = inject(SharedResizeObserver);
    private resizeObserverSubscription: Subscription | null = null;

    private contentObserver = inject(ContentObserver);
    private contentObserverSubscription: Subscription | null = null;

    get textElement(): HTMLElement {
        return this.option.textElement.nativeElement;
    }

    get isOverflown(): boolean {
        return this.textElement.clientWidth < this.textElement.scrollWidth;
    }

    constructor(private option: KbqOption) {
        super();
    }

    ngAfterViewInit() {
        this.content = this.option.viewValue;

        this.contentObserverSubscription = this.contentObserver
            .observe(this.textElement)
            .subscribe(() => (this.content = this.option.viewValue));
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.resizeObserverSubscription?.unsubscribe();
        this.contentObserverSubscription?.unsubscribe();
    }

    onMouseEnter() {
        this.resizeObserverSubscription = this.resizeObserver
            .observe(this.textElement)
            .subscribe(() => (this.disabled = !this.isOverflown));

        this.disabled = !this.isOverflown;
    }

    onMouseLeave() {
        this.resizeObserverSubscription?.unsubscribe();

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
