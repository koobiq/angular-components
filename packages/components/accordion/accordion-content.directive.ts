import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
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
export class KbqAccordionContentDirective implements AfterContentInit, AfterViewInit {
    private readonly renderer: Renderer2 = inject(Renderer2);
    private readonly platform = inject(Platform);

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

    constructor() {
        this.afterRenderRef = afterNextRender(() => {
            this.enableAnimation();

            this.afterRenderRef?.destroy();
        });
    }

    ngAfterViewInit(): void {
        this.disableAnimation();
    }

    ngAfterContentInit(): void {
        if (!this.platform.isBrowser) return;

        const { height } = this.nativeElement.getBoundingClientRect();

        this.renderer.setStyle(
            this.nativeElement,
            '--kbq-accordion-content-height',
            `${height}px`,
            RendererStyleFlags2.DashCase
        );
    }

    toggle() {
        this.hidden.set(!this.item.expanded);
    }

    disableAnimation() {
        this.savedTransition = this.nativeElement.style.transition;

        this.nativeElement.style.transition = 'none';
    }

    enableAnimation() {
        this.nativeElement.style.transition = this.savedTransition;
    }
}
