import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { AfterViewInit, Directive, inject, input, OnDestroy } from '@angular/core';
import { KBQ_WINDOW, KbqOption } from '@koobiq/components/core';
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
    private readonly option = inject(KbqOption);
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);
    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly window = inject(KBQ_WINDOW);

    private readonly debounceInterval = 100;

    private resizeSubscription = Subscription.EMPTY;
    private contentObserverSubscription = Subscription.EMPTY;
    private focusMonitorSubscription = Subscription.EMPTY;

    /**
     * Overrides the tooltip's hoverable default. The overflow hint floats over the neighbouring options of a
     * scrolling list, so a pointer-capturing pane would swallow the click that selects them.
     */
    readonly ignoreTooltipPointerEvents = input<boolean>(true);

    get textElement(): HTMLElement {
        return this.option.textElement.nativeElement;
    }

    get isOverflown(): boolean {
        if (!this.isBrowser) return false;

        const textElement = this.textElement;

        // The per-line check is second on purpose: it only has to answer for a two-line option, whose
        // lines clip themselves and therefore never widen this element's own `scrollWidth`.
        return textElement.clientWidth < textElement.scrollWidth || this.hasClippedLine(textElement);
    }

    /**
     * Whether one of the option's own line boxes is truncating its text with an ellipsis.
     *
     * A two-line option gives each line its own clipping box, because `text-overflow` only trims the
     * inline content of the box that clips it. That keeps the overflow out of the measurement above, so
     * the lines have to be asked directly.
     *
     * `kbq-title` solves the same problem by letting the consumer mark each line with `#kbqTitleText`,
     * but this directive resolves its measured element from `KbqOption`'s view query, which cannot see
     * projected content — hence the DOM walk.
     *
     * The ellipsis is part of the condition so that a child clipping for some other reason — a
     * fixed-ratio media box such as `kbq-flag`, visually-hidden text — is not read as truncated text.
     */
    private hasClippedLine(textElement: HTMLElement): boolean {
        const { children } = textElement;

        for (let index = 0; index < children.length; index++) {
            const line = children[index];

            if (
                line.clientWidth < line.scrollWidth &&
                this.window.getComputedStyle(line).textOverflow.includes('ellipsis')
            ) {
                return true;
            }
        }

        return false;
    }

    constructor() {
        super();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        this.content = this.option.viewValue;
        this.disabled = !this.isOverflown;

        this.resizeSubscription = this.resizeObserver
            .observe(this.textElement)
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => (this.disabled = !this.isOverflown));

        this.contentObserverSubscription = this.contentObserver
            .observe(this.textElement)
            .pipe(throttleTime(this.debounceInterval))
            .subscribe(() => {
                this.disabled = !this.isOverflown;
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
        this.disabled = !this.isOverflown;
    }

    handleElementLeave() {
        this.disabled = true;
    }
}
