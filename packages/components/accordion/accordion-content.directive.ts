import {
    afterNextRender,
    AfterRenderRef,
    AfterViewInit,
    Directive,
    inject,
    Renderer2,
    RendererStyleFlags2,
    signal
} from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: '[kbqAccordionContent]',
    host: {
        '[attr.id]': 'contentId',
        '[attr.role]': '"region"',
        '[attr.hidden]': 'hidden() ? "" : null',
        '[attr.aria-labelledby]': 'triggerId',

        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation',

        '(transitionend)': 'toggle()'
    },
    exportAs: 'kbqAccordionContent'
})
export class KbqAccordionContentDirective implements AfterViewInit {
    private readonly renderer: Renderer2 = inject(Renderer2);

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
    private readonly afterRenderRef?: AfterRenderRef;

    /** Whether the first browser render has happened, i.e. whether the content can be measured. */
    private rendered = false;

    constructor() {
        // `afterNextRender` never runs on the server, so no platform check is needed here.
        this.afterRenderRef = afterNextRender(() => {
            this.rendered = true;

            this.updateHeight();
            this.enableAnimation();

            this.afterRenderRef?.destroy();
        });
    }

    ngAfterViewInit(): void {
        this.disableAnimation();
    }

    toggle() {
        // Re-measure while the content is still collapsed. Its natural height depends on the width
        // it is finally laid out at, and that width is not known at first render when the accordion
        // lives in a container sized afterwards (sidepanel, overlay, responsive layout).
        if (this.rendered && this.item.expanded && this.hidden()) {
            this.updateHeight();
        }

        this.hidden.set(!this.item.expanded);
    }

    disableAnimation() {
        this.savedTransition = this.nativeElement.style.transition;

        this.nativeElement.style.transition = 'none';
    }

    enableAnimation() {
        this.nativeElement.style.transition = this.savedTransition;
    }

    /**
     * Publishes the natural height of the projected content as `--kbq-accordion-content-height`,
     * which the open state animates towards.
     *
     * `scrollHeight` is used rather than `getBoundingClientRect()`: the host is `overflow: hidden`
     * and collapsed to `height: 0` while closed, so its box reports `0`, whereas `scrollHeight`
     * still reports the height of the content it clips.
     */
    private updateHeight(): void {
        this.renderer.setStyle(
            this.nativeElement,
            '--kbq-accordion-content-height',
            `${this.nativeElement.scrollHeight}px`,
            RendererStyleFlags2.DashCase
        );
    }
}
