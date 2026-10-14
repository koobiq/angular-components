import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, Directive, inject, OnDestroy } from '@angular/core';
import { KbqOption } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subscription, throttleTime } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
    selector: 'kbq-option',
    host: {
        '(mouseenter)': 'handleElementEnter()',
        '(mouseleave)': 'handleElementLeave()'
    }
})
export class KbqOptionTooltip extends KbqTooltipTrigger implements AfterViewInit, OnDestroy {
    /**
     * The hint repeats text the option had to clip, so `kbqTooltipDisabled="false"` cannot conjure one for an
     * option that fits.
     * @docs-private */
    protected override readonly derivedDisabledWins = true;

    private readonly option = inject(KbqOption);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);
    private readonly isBrowser = inject(Platform).isBrowser;

    private readonly debounceInterval = 100;

    private resizeSubscription = Subscription.EMPTY;
    private contentObserverSubscription = Subscription.EMPTY;
    private focusMonitorSubscription = Subscription.EMPTY;

    get textElement(): HTMLElement {
        return this.option.textElement.nativeElement;
    }

    get isOverflown(): boolean {
        if (!this.isBrowser) return false;

        return this.textElement.clientWidth < this.textElement.scrollWidth;
    }

    constructor() {
        super();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        this.content = this.option.viewValue;
        this.setDerivedDisabled(!this.isOverflown);

        this.resizeSubscription = this.resizeObserver
            .observe(this.textElement)
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => this.setDerivedDisabled(!this.isOverflown));

        this.contentObserverSubscription = this.contentObserver
            .observe(this.textElement)
            .pipe(throttleTime(this.debounceInterval))
            .subscribe(() => {
                this.setDerivedDisabled(!this.isOverflown);
                this.content = this.option.viewValue;
            });

        this.focusMonitorSubscription = this.focusMonitor
            .monitor(this.elementRef)
            .subscribe((origin) => (origin === 'keyboard' ? this.handleElementEnter() : this.handleElementLeave()));
    }

    ngOnDestroy() {
        this.resizeSubscription.unsubscribe();
        this.contentObserverSubscription.unsubscribe();
        this.focusMonitorSubscription.unsubscribe();

        super.ngOnDestroy();
    }

    handleElementEnter() {
        this.setDerivedDisabled(!this.isOverflown);
    }

    handleElementLeave() {
        this.setDerivedDisabled(true);
    }
}
