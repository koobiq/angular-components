import { coerceCssPixelValue } from '@angular/cdk/coercion';
import {
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Injector,
    OnDestroy,
    Renderer2,
    Signal,
    signal,
    TemplateRef
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { kbqAfterAnimations, kbqAnimationsDisabled } from '../animation/animations-state';
import { PopUpPlacements, PopUpVisibility } from './constants';
import { KbqPopUpTrigger } from './pop-up-trigger';

@Directive({
    host: {
        '(mouseenter)': 'setHovered(true)',
        '(mouseleave)': 'setHovered(false)'
    }
})
export abstract class KbqPopUp implements OnDestroy {
    protected readonly renderer: Renderer2 = inject(Renderer2);
    private readonly hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    /** The element the pop-up measures and decorates: its host, unless a subclass renders a panel of its own. */
    protected get elementRef(): ElementRef<HTMLElement> {
        return this.hostElementRef;
    }
    protected readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
    readonly destroyRef = inject(DestroyRef);

    /**
     * Whether the pop-up appears without motion.
     * @docs-private
     */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    private readonly hostInjector = inject(Injector);

    private readonly hoveredState = signal(false);

    /** Whether the pointer is over the pop-up. */
    readonly hovered: Signal<boolean> = this.hoveredState.asReadonly();

    trigger: KbqPopUpTrigger<unknown>;
    header: string | TemplateRef<unknown>;
    content: string | TemplateRef<unknown>;
    context: { $implicit: unknown } | null;

    private readonly classMapState = signal({});

    /** CSS classes of the pop-up element: the placement, the custom class and the modifiers of the subclass. */
    get classMap() {
        return this.classMapState();
    }

    set classMap(value) {
        this.classMapState.set(value);
    }

    warning: boolean;
    arrow: boolean;
    defaultPaddings: boolean;

    offset: number | null;

    private readonly visibilityState = signal(PopUpVisibility.Initial);

    /** Stage of the pop-up's life: not shown yet, visible, or hidden. */
    get visibility(): PopUpVisibility {
        return this.visibilityState();
    }

    set visibility(value: PopUpVisibility) {
        this.visibilityState.set(value);
    }

    visibleChange = new EventEmitter<boolean>();

    protected prefix: string;

    /** Subject for notifying that the tooltip has been hidden from the view */
    protected readonly onHideSubject = new Subject<void>();

    protected closeOnInteraction: boolean = false;

    private showTimeoutId: any;
    private hideTimeoutId: any;

    /** Handler bound on the pop-up element to hide it on `mouseleave`, or `null` while none is bound. */
    private hideOnMouseLeave: (() => void) | null = null;

    private showAnimation?: { destroy(): void };

    ngOnDestroy() {
        clearTimeout(this.showTimeoutId);
        clearTimeout(this.hideTimeoutId);

        this.removeEventListenerForHide();

        this.onHideSubject.complete();
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
            this.waitForShowAnimation();

            if (this.trigger.triggerName === 'mouseenter') {
                this.addEventListenerForHide();
            }
        }, delay);
    }

    /**
     * Hides the popup after a specified delay.
     *
     * The hide timeout triggers the hiding of the popup by updating visibility and emitting relevant events.
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

    /** Records whether the pointer is over the pop-up, and lets the trigger re-evaluate its delayed hide. */
    protected setHovered(value: boolean): void {
        this.hoveredState.set(value);
        // Optional: a panel rendered on its own, without a trigger, is hoverable too.
        this.trigger?.handleHoverChange();
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    detectChanges(): void {
        this.changeDetectorRef.detectChanges();
    }

    /**
     * Called once the pop-up has animated in. Only the entrance animates: `hide()` emits `onHideSubject`
     * synchronously and `KbqPopUpTrigger` detaches the overlay in the same call stack.
     */
    protected afterShowAnimation(): void {}

    handleBodyInteraction(): void {
        if (this.closeOnInteraction) {
            this.hide(0);
        }
    }

    /** Holds closing on an outside interaction off until the pop-up has animated in. */
    private waitForShowAnimation(): void {
        this.closeOnInteraction = false;
        this.showAnimation?.destroy();
        this.showAnimation = kbqAfterAnimations(
            // Read once rendered: a subclass queries the animated element from its view.
            () => this.elementRef?.nativeElement,
            () => {
                this.closeOnInteraction = true;
                this.afterShowAnimation();
            },
            this.hostInjector
        );
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
