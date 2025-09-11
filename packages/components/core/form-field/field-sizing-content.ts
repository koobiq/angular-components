import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, inject, Renderer2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';
import { KBQ_WINDOW } from '../tokens';
import { kbqInjectNativeElement } from '../utils';

const INITIAL_PROPERTIES = {
    all: 'initial',
    position: 'absolute',
    top: coerceCssPixelValue(0),
    left: coerceCssPixelValue(0),
    width: coerceCssPixelValue(0),
    height: coerceCssPixelValue(0),
    visibility: 'hidden',
    overflow: 'scroll',
    whiteSpace: 'pre',
    pointerEvents: 'none'
} as const satisfies Partial<CSSStyleDeclaration>;

/**
 * Properties that can affect element width and should be inherited from the parent.
 */
const WIDTH_INHERITED_PROPERTIES = [
    'font',
    'fontFamily',
    'fontFeatureSettings',
    'fontKerning',
    'fontOpticalSizing',
    'fontSizeAdjust',
    'fontSize',
    'fontStretch',
    'fontSynthesis',
    'fontVariant',
    'fontVariantLigatures',
    'fontVariationSettings',
    'fontWeight',
    'letterSpacing',
    'textIndent',
    'textTransform'
] as const satisfies Array<keyof CSSStyleDeclaration>;

/**
 * Properties that should be added to the width when `box-sizing: border-box` is applied.
 */
const BOX_SIZING_BORDER_BOX_WIDTH_PROPERTIES = [
    'paddingLeft',
    'paddingRight',
    'borderLeftWidth',
    'borderRightWidth'
] as const satisfies Array<keyof CSSStyleDeclaration>;

const FIELD_RESIZE_EVENTS = ['input', 'change', 'focus'] as const;

/**
 * Emulates [`field-sizing: content`](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing) CSS property for
 * browsers that do not support it natively.
 *
 * @docs-private
 */
@Directive({
    standalone: true,
    selector: '[kbqFieldSizingContent]',
    exportAs: 'kbqFieldSizingContent',
    host: {
        class: 'kbq-field-sizing-content'
    }
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
        const ruler = this.createRuler(computedStyle);

        ruler.textContent = this.element.value || this.element.placeholder || '';

        this.renderer.appendChild(this.document.body, ruler);

        const width = this.calculateWidth(ruler, computedStyle);

        this.renderer.setStyle(this.element, 'width', coerceCssPixelValue(width));
        this.renderer.removeChild(this.document.body, ruler);
    }

    private createRuler(computedStyle: CSSStyleDeclaration): HTMLSpanElement {
        const ruler: HTMLSpanElement = this.renderer.createElement('span');

        Object.assign(ruler.style, INITIAL_PROPERTIES);
        WIDTH_INHERITED_PROPERTIES.forEach((property) => {
            ruler.style[property] = computedStyle[property];
        });

        return ruler;
    }

    private calculateWidth(ruler: HTMLSpanElement, computedStyle: CSSStyleDeclaration): number {
        if (computedStyle.boxSizing === 'border-box') {
            return BOX_SIZING_BORDER_BOX_WIDTH_PROPERTIES.reduce(
                (width, property) => width + (parseFloat(computedStyle[property]) || 0),
                ruler.scrollWidth
            );
        }

        return ruler.scrollWidth;
    }
}
