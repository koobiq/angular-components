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
    header: string | TemplateRef<any>;
    content: string | TemplateRef<any>;
    context: { $implicit: any } | null;

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

    ngOnDestroy() {
        clearTimeout(this.showTimeoutId);
        clearTimeout(this.hideTimeoutId);

        this.onHideSubject.complete();
        this.hovered.complete();
    }

    isTemplateRef(value: any): boolean {
        return value instanceof TemplateRef;
    }

    show(delay: number): void {
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
        this.classMap = {
            [`${this.prefix}_placement-${placement}`]: true,
            [customClass]: !!customClass,
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

    animationDone({ toState }: AnimationEvent): void {
        if (toState === PopUpVisibility.Hidden && !this.isVisible()) {
            this.onHideSubject.next();
        }

        if (toState === PopUpVisibility.Visible || toState === PopUpVisibility.Hidden) {
            this.closeOnInteraction = true;
        }
    }

    handleBodyInteraction(): void {
        if (this.closeOnInteraction) {
            this.hide(0);
        }
    }

    protected addEventListenerForHide() {
        this.elementRef.nativeElement.addEventListener('mouseleave', () => this.hide(0));
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
