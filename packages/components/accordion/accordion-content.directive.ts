import {
    AfterContentInit,
    afterNextRender,
    AfterRenderRef,
    AfterViewInit,
    Directive,
    inject,
    Renderer2,
    signal
} from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqAccordionItem } from './accordion-item';

@Directive({
    selector: '[kbqAccordionContent]',
    exportAs: 'kbqAccordionContent',
    host: {
        '[attr.role]': '"region"',
        '[attr.hidden]': 'hidden().toString()',

        '[attr.data-state]': 'item.dataState',
        '[attr.data-disabled]': 'item.disabled',
        '[attr.data-orientation]': 'item.orientation',

        '(transitionend)': 'hidden.set(!this.item.expanded)'
    }
})
export class KbqAccordionContentDirective implements AfterContentInit, AfterViewInit {
    private readonly renderer: Renderer2 = inject(Renderer2);

    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly item = inject(KbqAccordionItem);

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
        const { height, width } = this.nativeElement.getBoundingClientRect();

        this.renderer.setProperty(
            this.nativeElement,
            'style',
            `
            --radix-accordion-content-height: ${height}px;
            --radix-accordion-content-width: ${width}px;
        `
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
