import { ContentObserver } from '@angular/cdk/observers';
import {
    AfterViewInit,
    ContentChild,
    Directive,
    ElementRef,
    Host,
    inject,
    Inject,
    OnDestroy,
    Optional
} from '@angular/core';
import { KBQ_TITLE_TEXT_REF, KbqTitleTextRef, PopUpTriggers } from '@koobiq/components/core';
import {
    KBQ_TOOLTIP_OPEN_TIME_PROVIDER,
    KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqTooltipTrigger
} from '@koobiq/components/tooltip';
import { Subject, Subscription, throttleTime } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
    standalone: true,
    providers: [KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER, KBQ_TOOLTIP_OPEN_TIME_PROVIDER],
    selector: '[kbq-title]',
    exportAs: 'kbqTitle',
    host: {
        class: 'test_test_Test',
        '(mouseenter)': 'handleElementEnter()',
        '(mouseleave)': 'hideTooltip()',
        '(window:resize)': 'resizeStream.next($event)'
    }
})
export class KbqTitleDirective extends KbqTooltipTrigger implements AfterViewInit, OnDestroy {
    private contentObserver = inject(ContentObserver);

    // todo need rename kbqTrigger in popover, tooltip and title. Here workaround for kbq-title and popover on one button
    set trigger(value: string) {
        super.trigger = value;
    }

    get trigger(): string {
        return PopUpTriggers.Hover;
    }

    get isOverflown(): boolean {
        return this.parent?.offsetWidth < this.child.scrollWidth || this.parent?.offsetHeight < this.child.scrollHeight;
    }

    get viewValue(): string {
        return (this.parent?.textContent || '').trim();
    }

    get parent(): HTMLElement {
        return this.parentContainer?.nativeElement || this.parentContainer;
    }

    get child(): HTMLElement {
        return this.childContainer.nativeElement || this.childContainer;
    }

    readonly resizeStream = new Subject<Event>();

    private readonly debounceInterval: number = 100;

    private resizeSubscription = Subscription.EMPTY;
    private contentObserverSubscription = Subscription.EMPTY;
    private focusMonitorSubscription = Subscription.EMPTY;

    @ContentChild('kbqTitleText', { descendants: true, static: true })
    private childContainer: ElementRef;

    @ContentChild('kbqTitleContainer')
    private parentContainer: ElementRef;

    constructor(@Host() @Optional() @Inject(KBQ_TITLE_TEXT_REF) private componentInstance?: KbqTitleTextRef) {
        super();
    }

    ngAfterViewInit() {
        this.parentContainer = this.parentContainer || this.componentInstance?.parentTextElement || this.elementRef;
        this.childContainer = this.childContainer || this.componentInstance?.textElement || this.elementRef;
        this.content = this.viewValue;

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => (this.disabled = !this.isOverflown));

        this.contentObserverSubscription = this.contentObserver
            .observe(this.parent)
            .pipe(throttleTime(this.debounceInterval))
            .subscribe(() => {
                this.disabled = !this.isOverflown;
                this.content = this.viewValue;
            });

        this.focusMonitorSubscription = this.focusMonitor
            .monitor(this.elementRef)
            .subscribe((origin) => (origin === 'keyboard' ? this.handleElementEnter() : this.hideTooltip()));
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.resizeSubscription.unsubscribe();
        this.contentObserverSubscription.unsubscribe();
        this.focusMonitorSubscription.unsubscribe();
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    handleElementEnter() {
        this.disabled = !this.isOverflown;
    }

    hideTooltip() {
        this.disabled = true;
    }
}
