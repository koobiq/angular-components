import { AnimationEvent } from '@angular/animations';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import {
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    OnDestroy,
    Renderer2,
    TemplateRef
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PopUpPlacements, PopUpVisibility } from './constants';
import { KbqPopUpTrigger } from './pop-up-trigger';

@Directive({
    host: {
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)'
    }
})
export abstract class KbqPopUp implements OnDestroy {
    protected readonly renderer: Renderer2 = inject(Renderer2);
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    readonly destroyRef = inject(DestroyRef);

    /** Stream that emits when the popup item is hovered. */
    readonly hovered = new BehaviorSubject<boolean>(false);

    trigger: KbqPopUpTrigger<unknown>;
    header: string | TemplateRef<unknown>;
    content: string | TemplateRef<unknown>;
    context: { $implicit: unknown } | null;

    classMap = {};

    warning: boolean;
    arrow: boolean;
    defaultPaddings: boolean;

    offset: number | null;

    visibility = PopUpVisibility.Initial;
    visibleChange = new EventEmitter<boolean>();

    protected prefix: string;

    /** Subject for notifying that the tooltip has been hidden from the view */
    protected readonly onHideSubject = new Subject<void>();

    protected closeOnInteraction: boolean = false;

    private showTimeoutId: any;
    private hideTimeoutId: any;

    /** Handler bound on the pop-up element to hide it on `mouseleave`, or `null` while none is bound. */
    private hideOnMouseLeave: (() => void) | null = null;

    ngOnDestroy() {
        clearTimeout(this.showTimeoutId);
        clearTimeout(this.hideTimeoutId);

        this.removeEventListenerForHide();

        this.onHideSubject.complete();
        this.hovered.complete();
        // Completed here rather than left dangling: the trigger subscribes to it once per show and keeps that
        // subscription for its own lifetime, so a trigger that outlives many pop-ups would otherwise accumulate
        // one live subscriber per show.
        this.visibleChange.complete();
    }

    isTemplateRef(value: any): boolean {
        return value instanceof TemplateRef;
    }

    show(delay: number): void {
        // Symmetrical to the clearing `hide()` does: `KbqPopUpTrigger.show()` re-enters this method on every
        // re-hover while the pop-up stays attached, and without this each re-entry queues another show task.
        // The extra tasks outlive the very teardown meant to cancel them — the first one to fire resets
        // `showTimeoutId`, so `hide()` and `ngOnDestroy` then clear nothing and the rest run against a
        // destroyed component.
        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
        }

        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
        }

        this.closeOnInteraction = true;

        this.showTimeoutId = setTimeout(() => {
            this.showTimeoutId = undefined;

            this.visibility = PopUpVisibility.Visible;
            this.visibleChange.emit(true);
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this.markForCheck();

            if (this.trigger.triggerName === 'mouseenter') {
                this.addEventListenerForHide();
            }
        }, delay);
    }

    /**
     * Hides the popup after a specified delay.
     *
     * The hide timeout triggers the hiding of the popup by updating visibility and emitting relevant events.
     * Also, it marks for check to ensure proper change detection, especially for parent components with OnPush strategy.
     * @param delay - The delay in milliseconds before hiding the popup.
     */
    hide(delay: number): void {
        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
        }

        // Repeated `hide()` calls must not stack timers: without this the earliest pending timeout still
        // fires, hiding the pop-up before the delay of the call that actually replaced it has elapsed.
        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
        }

        this.hideTimeoutId = setTimeout(() => {
            this.hideTimeoutId = undefined;
            this.visibility = PopUpVisibility.Hidden;

            this.visibleChange.emit(false);
            this.onHideSubject.next();

            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this.markForCheck();
        }, delay);
    }

    isVisible(): boolean {
        return this.visibility === PopUpVisibility.Visible;
    }

    updateClassMap(placement: string, customClass: string, classMap?): void {
        // `customClass` may be a whitespace-separated list of class names; expand it into
        // individual keys so the native `[class]` binding (which doesn't tokenise object keys)
        // applies each class correctly.
        const customClasses: Record<string, boolean> = {};

        for (const token of (customClass ?? '').split(/\s+/).filter(Boolean)) {
            customClasses[token] = true;
        }

        this.classMap = {
            [`${this.prefix}_placement-${placement}`]: true,
            ...customClasses,
            ...classMap
        };
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHideSubject.asObservable();
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    detectChanges(): void {
        this.changeDetectorRef.detectChanges();
    }

    animationStart() {
        this.closeOnInteraction = false;
    }

    /**
     * Only the transition into `visible` is observable here: `hide()` emits `onHideSubject` synchronously and
     * `KbqPopUpTrigger` detaches the overlay in the same call stack, so the view is destroyed before the
     * `* => hidden` transition can start. Making the fade-out actually play belongs to the migration off the
     * deprecated `@angular/animations` API, together with the `prefers-reduced-motion` gate.
     */
    animationDone({ toState }: AnimationEvent): void {
        if (toState === PopUpVisibility.Visible) {
            this.closeOnInteraction = true;
        }
    }

    handleBodyInteraction(): void {
        if (this.closeOnInteraction) {
            this.hide(0);
        }
    }

    /** Binds the `mouseleave` hide listener on the pop-up element, at most once per instance. */
    protected addEventListenerForHide() {
        if (this.hideOnMouseLeave) return;

        this.hideOnMouseLeave = () => this.hide(0);

        this.elementRef.nativeElement.addEventListener('mouseleave', this.hideOnMouseLeave);
    }

    /** Unbinds the `mouseleave` hide listener bound by {@link addEventListenerForHide}. */
    private removeEventListenerForHide() {
        if (!this.hideOnMouseLeave) return;

        this.elementRef.nativeElement.removeEventListener('mouseleave', this.hideOnMouseLeave);

        this.hideOnMouseLeave = null;
    }

    protected setStickPosition() {
        const oppositeSide = {
            [PopUpPlacements.Top]: PopUpPlacements.Bottom,
            [PopUpPlacements.Bottom]: PopUpPlacements.Top,
            [PopUpPlacements.Right]: PopUpPlacements.Left,
            [PopUpPlacements.Left]: PopUpPlacements.Right
        }[this.trigger.stickToWindow];

        if (!this.trigger.stickToWindow || !oppositeSide) return;

        this.arrow = false;

        if (this.trigger.container) {
            const { width, height } = this.elementRef.nativeElement.getBoundingClientRect();
            const { right, left, top, bottom } = this.trigger.container.getBoundingClientRect();

            if (this.trigger.stickToWindow === PopUpPlacements.Right) {
                this.renderer.setStyle(
                    this.trigger.overlayRef?.overlayElement,
                    'left',
                    coerceCssPixelValue(right - width)
                );
            } else if (this.trigger.stickToWindow === PopUpPlacements.Left) {
                this.renderer.setStyle(this.trigger.overlayRef?.overlayElement, 'left', coerceCssPixelValue(left));
            } else if (this.trigger.stickToWindow === PopUpPlacements.Top) {
                this.renderer.setStyle(this.trigger.overlayRef?.overlayElement, 'top', coerceCssPixelValue(top));
            } else if (this.trigger.stickToWindow === PopUpPlacements.Bottom) {
                this.renderer.setStyle(
                    this.trigger.overlayRef?.overlayElement,
                    'top',
                    coerceCssPixelValue(bottom - height)
                );
            }

            this.renderer.setStyle(this.trigger.overlayRef?.overlayElement, 'right', 'unset');
            this.renderer.setStyle(this.trigger.overlayRef?.overlayElement, 'bottom', 'unset');
        } else {
            this.renderer.setStyle(this.trigger.overlayRef?.overlayElement, this.trigger.stickToWindow, 0);
            this.renderer.setStyle(this.trigger.overlayRef?.overlayElement, oppositeSide, 'unset');
        }
    }
}
