import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, inject, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';
import { KBQ_WINDOW } from '../tokens';
import { kbqInjectNativeElement } from '../utils';
import { kbqCreateTextRuler, kbqMeasureRulerText } from './text-ruler';

/**
 * Properties that should be added to the width when `box-sizing: border-box` is applied.
 */
const BOX_SIZING_BORDER_BOX_WIDTH_PROPERTIES = [
    'paddingLeft',
    'paddingRight',
    'borderLeftWidth',
    'borderRightWidth'
] as const satisfies Array<keyof CSSStyleDeclaration>;

const FIELD_RESIZE_EVENTS = ['input', 'change', 'focus', 'blur'] as const;

/**
 * Emulates [`field-sizing: content`](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing) CSS property for
 * browsers that do not support it natively.
 *
 * @docs-private
 */
@Directive({
    selector: '[kbqFieldSizingContent]',
    host: {
        class: 'kbq-field-sizing-content'
    },
    exportAs: 'kbqFieldSizingContent'
})
export class KbqFieldSizingContent {
    private readonly element = kbqInjectNativeElement<HTMLInputElement>();
    private readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);
    private readonly document = inject(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        afterNextRender(() => this.emulate());
    }

    private emulate(): void {
        if (CSS.supports('field-sizing', 'content')) {
            this.renderer.setStyle(this.element, 'fieldSizing', 'content');

            return;
        }

        merge(...FIELD_RESIZE_EVENTS.map((event) => fromEvent(this.element, event)))
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.setupWidth());

        this.setupWidth();
    }

    private setupWidth(): void {
        const computedStyle = this.window.getComputedStyle(this.element);
        const ruler = kbqCreateTextRuler(this.document, computedStyle);
        const text = this.element.value || this.element.placeholder || '';

        this.renderer.appendChild(this.document.body, ruler);

        // We should add space to prevent text truncation in Safari/Firefox
        const width = this.calculateWidth(kbqMeasureRulerText(ruler, text && `${text} `), computedStyle);

        this.renderer.setStyle(this.element, 'width', coerceCssPixelValue(width));
        this.renderer.removeChild(this.document.body, ruler);
    }

    private calculateWidth(textWidth: number, computedStyle: CSSStyleDeclaration): number {
        if (computedStyle.boxSizing === 'border-box') {
            return BOX_SIZING_BORDER_BOX_WIDTH_PROPERTIES.reduce(
                (width, property) => width + (parseFloat(computedStyle[property]) || 0),
                textWidth
            );
        }

        return textWidth;
    }
}
