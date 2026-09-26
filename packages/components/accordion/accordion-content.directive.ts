import { Platform } from '@angular/cdk/platform';
import {
    afterNextRender,
    AfterViewInit,
    Directive,
    DoCheck,
    inject,
    Injector,
    OnInit,
    Renderer2,
    RendererStyleFlags2,
    signal
} from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqAccordionItem } from './accordion-item';

const CONTENT_HEIGHT = '--kbq-accordion-content-height';

@Directive({
    selector: '[kbqAccordionContent]',
    host: {
        '[attr.id]': 'contentId',
        '[attr.role]': '"region"',
        '[attr.hidden]': 'hidden() ? "" : null',
        // `hidden` alone does not take the collapsed content out of the tab order: the host keeps an
        // explicit `display: block` so the height can animate, which overrides `[hidden]`'s
        // `display: none`. Without `inert`, every control inside a closed section stays focusable in
        // a zero-height, clipped box.
        '[attr.inert]': 'hidden() ? "" : null',
        '[attr.aria-labelledby]': 'triggerId',

        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation',

        '(transitionend)': 'onTransitionEnd($event)',
        '(transitioncancel)': 'onTransitionEnd($event)'
    },
    exportAs: 'kbqAccordionContent'
})
export class KbqAccordionContentDirective implements OnInit, DoCheck, AfterViewInit {
    private readonly renderer: Renderer2 = inject(Renderer2);
    private readonly platform = inject(Platform);
    private readonly injector = inject(Injector);

    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly item = inject(KbqAccordionItem);

    /** @docs-private */
    get contentId(): string {
        return `${this.item.id}-content`;
    }

    /** @docs-private */
    get triggerId(): string {
        return `${this.item.id}-trigger`;
    }

    /** @docs-private */
    protected readonly hidden = signal<boolean>(true);

    private savedTransition: string;

    /** Whether the first browser render has happened; until then a toggle only sets the initial state. */
    private rendered = false;

    constructor() {
        // `afterNextRender` never runs on the server, so no platform check is needed here.
        afterNextRender(() => {
            this.rendered = true;

            this.enableAnimation();
        });
    }

    ngOnInit(): void {
        // Content the item's `toggle()` cannot have reached yet: created after the item initialized (inside
        // `@if` or `@defer`), or outside the item's own template.
        this.toggle();
    }

    ngDoCheck(): void {
        // The item cannot reach content declared in a child component's template to toggle it.
        if (this.hidden() === this.item.expanded) {
            this.toggle();
        }
    }

    ngAfterViewInit(): void {
        // Skipped on the server: the write would reach the prerendered `style` attribute, and hydration
        // reuses that node, so the client would read `none` back as the transition worth restoring and
        // `enableAnimation()` would make it permanent. There is nothing to suppress without a paint.
        if (!this.platform.isBrowser) return;

        this.disableAnimation();
    }

    toggle() {
        if (this.rendered) {
            this.pinHeight();
        }

        this.hidden.set(!this.item.expanded);
    }

    /** @docs-private */
    protected onTransitionEnd(event: TransitionEvent): void {
        // Transitions of the projected content and of pseudo-elements bubble up here as well.
        if (event.target !== this.nativeElement || event.propertyName !== 'height' || event.pseudoElement) return;

        // The transition that ended or was cancelled may already be replaced by one that still needs the pin.
        if (!this.isHeightTransitionRunning()) {
            this.releaseHeight();
        }
    }

    disableAnimation() {
        this.savedTransition = this.nativeElement.style.transition;

        this.nativeElement.style.transition = 'none';
    }

    enableAnimation() {
        this.nativeElement.style.transition = this.savedTransition;
    }

    /**
     * Pins the height the transition runs between: the natural height of the content when expanding,
     * the current one when collapsing. The pin is released once the transition ends, so expanded
     * content keeps `height: auto` and follows its own size — its container can be laid out later
     * (a content panel, an overlay) or resized, and nested items can toggle.
     *
     * `scrollHeight` reports the natural height even while the `overflow: hidden` host is collapsed.
     */
    private pinHeight(): void {
        const element = this.nativeElement;

        // No transition would release the pin.
        if (element.style.transition === 'none') {
            this.releaseHeight();

            return;
        }

        const expanded = this.item.expanded;
        const current = element.offsetHeight;
        const target = expanded ? element.scrollHeight : 0;

        // Nothing to animate: no box yet (e.g. in a closed content panel), or already there.
        if (current === target) {
            this.releaseHeight();

            return;
        }

        this.setHeight(expanded ? target : current);

        // A collapse starts from `auto`, which does not transition: commit the pinned height before
        // `data-state` flips.
        if (!expanded) {
            element.getBoundingClientRect();
        }

        afterNextRender(() => this.settleHeight(), { injector: this.injector });
    }

    /** Checks the pin once `data-state` has flipped. */
    private settleHeight(): void {
        const running = this.isHeightTransitionRunning();

        if (running === false) {
            // Transitions are off (a stylesheet, reduced motion), so no `transitionend` will release the pin.
            this.releaseHeight();
        } else if (this.item.expanded) {
            // Content rendered by the flip itself (`@if`, `@defer`) was not there to measure: retarget.
            this.setHeight(this.nativeElement.scrollHeight);
        }
    }

    /** Whether a height transition runs on the host; `undefined` without the Web Animations API. */
    private isHeightTransitionRunning(): boolean | undefined {
        return this.nativeElement
            .getAnimations?.()
            .some((animation) => (animation as CSSTransition).transitionProperty === 'height');
    }

    private setHeight(height: number): void {
        this.renderer.setStyle(this.nativeElement, CONTENT_HEIGHT, `${height}px`, RendererStyleFlags2.DashCase);
    }

    private releaseHeight(): void {
        this.renderer.removeStyle(this.nativeElement, CONTENT_HEIGHT, RendererStyleFlags2.DashCase);
    }
}
