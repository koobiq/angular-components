import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    ContentChild,
    Directive,
    ElementRef,
    Host,
    Inject,
    NgZone,
    Optional,
    ViewContainerRef
} from '@angular/core';
import { KBQ_TITLE_TEXT_REF, KbqTitleTextRef } from '@koobiq/components/core';
import { KBQ_TOOLTIP_SCROLL_STRATEGY, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Observable, Subject, Subscription, throttleTime } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Directive({
    selector: '[kbq-title]',
    exportAs: 'kbqTitle',
    host: {
        '(mouseenter)': 'handleElementEnter()',
        '(mouseleave)': 'hideTooltip()',
        '(window:resize)': 'resizeStream.next($event)'
    }
})
export class KbqTitleDirective extends KbqTooltipTrigger implements AfterViewInit {
    get isOverflown(): boolean {
        return this.parent.offsetWidth < this.child.scrollWidth || this.parent.offsetWidth < this.child.offsetWidth || this.parent.clientHeight < this.child.scrollHeight;
    }

    get viewValue(): string {
        return (this.parent.textContent || '').trim();
    }

    get parent(): HTMLElement {
        return this.parentContainer.nativeElement || this.parentContainer;
    }

    get child(): HTMLElement {
        return this.childContainer.nativeElement || this.childContainer;
    }

    readonly resizeStream = new Subject<Event>();

    private readonly debounceInterval: number = 100;

    private resizeSubscription = Subscription.EMPTY;
    private mutationSubscription = Subscription.EMPTY;
    private focusMonitorSubscription = Subscription.EMPTY;

    @ContentChild('kbqTitleText', { descendants: true, static: true })
    private childContainer: ElementRef;

    @ContentChild('kbqTitleContainer')
    private parentContainer: ElementRef;

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        focusMonitor: FocusMonitor,
        @Inject(KBQ_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        @Host() @Optional() @Inject(KBQ_TITLE_TEXT_REF) private componentInstance?: KbqTitleTextRef
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction, focusMonitor);
    }

    ngAfterViewInit() {
        this.parentContainer = this.parentContainer || this.componentInstance?.parentTextElement || this.elementRef;
        this.childContainer = this.childContainer || this.componentInstance?.textElement || this.elementRef;
        this.content = this.viewValue;

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => this.disabled = !this.isOverflown);

        this.mutationSubscription = this.createMutationObserver()
            .pipe(throttleTime(this.debounceInterval))
            .subscribe(() => {
                this.disabled = !this.isOverflown;
                this.content = this.viewValue;
            });

        this.focusMonitorSubscription = this.focusMonitor.monitor(this.elementRef).subscribe(
            (origin) => (origin === 'keyboard')
                ? this.handleElementEnter() : this.hideTooltip()
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        this.resizeSubscription.unsubscribe();
        this.mutationSubscription.unsubscribe();
        this.focusMonitorSubscription.unsubscribe();
        this.focusMonitor.stopMonitoring(this.elementRef);
    }

    handleElementEnter() {
        this.disabled = !this.isOverflown;
    }

    hideTooltip() {
        this.disabled = true;
    }

    private createMutationObserver(): Observable<MutationRecord[]> {
        return new Observable((observer) => {
            const mutationObserver = new MutationObserver(
                (mutations) => observer.next(mutations)
            );
            mutationObserver.observe(this.parent, {
                characterData: true, attributes: false, childList: true, subtree: true
            });

            return () => mutationObserver.disconnect();
        });
    }
}
