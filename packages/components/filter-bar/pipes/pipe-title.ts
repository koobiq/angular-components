import {
    AfterViewInit,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    QueryList,
    TemplateRef
} from '@angular/core';
import { KBQ_TITLE_TEXT_REF, KbqTitleTextRef } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Observable, Subject, Subscription, throttleTime } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
    standalone: true,
    selector: '[kbqPipeTitle]',
    exportAs: 'kbqPipeTitle',
    host: {
        '(mouseenter)': 'handleElementEnter()',
        '(mouseleave)': 'hideTooltip()',
        '(window:resize)': 'resizeStream.next($event)'
    }
})
export class KbqPipeTitleDirective extends KbqTooltipTrigger implements AfterViewInit, OnDestroy {
    private componentInstance = inject<KbqTitleTextRef>(KBQ_TITLE_TEXT_REF, { optional: true, host: true });

    get isOverflown(): boolean {
        return this.childContainer.some(({ nativeElement }) => {
            return (
                this.parent.offsetWidth < nativeElement.scrollWidth ||
                this.parent.offsetHeight < nativeElement.scrollHeight
            );
        });
    }

    @Input({ alias: 'kbqPipeTitle' }) viewValue: TemplateRef<any>;

    get parent(): HTMLElement {
        return this.parentContainer?.nativeElement || this.parentContainer;
    }

    get child(): HTMLElement {
        return this.childContainer.first.nativeElement || this.childContainer;
    }

    readonly resizeStream = new Subject<Event>();

    private readonly debounceInterval: number = 100;

    private resizeSubscription = Subscription.EMPTY;
    private mutationSubscription = Subscription.EMPTY;
    private focusMonitorSubscription = Subscription.EMPTY;

    @ContentChildren('kbqTitleText', { descendants: true })
    private childContainer: QueryList<ElementRef>;

    @ContentChild('kbqTitleContainer')
    private parentContainer: ElementRef;

    ngAfterViewInit() {
        this.parentContainer = this.parentContainer || this.componentInstance?.parentTextElement || this.elementRef;
        this.childContainer = this.childContainer || this.componentInstance?.textElement || this.elementRef;
        this.content = this.viewValue;

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => (this.disabled = !this.isOverflown));

        this.mutationSubscription = this.createMutationObserver()
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
            const mutationObserver = new MutationObserver((mutations) => observer.next(mutations));
            mutationObserver.observe(this.parent, {
                characterData: true,
                attributes: false,
                childList: true,
                subtree: true
            });

            return () => mutationObserver.disconnect();
        });
    }
}
