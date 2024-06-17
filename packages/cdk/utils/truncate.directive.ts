import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    Input,
    OnChanges,
    Renderer2
} from '@angular/core';

/**
 * Directive to truncate the text within an element to a specified width.
 * The text will be truncated with ellipsis (...) if it exceeds the specified width.
 */
@Directive({
    selector: '[kbqTruncate]',
    standalone: true
})
export class KbqTruncateDirective implements OnChanges, AfterViewInit {
    private readonly elementRef = inject(ElementRef);
    private readonly renderer = inject(Renderer2);

    /**
     * Boolean attribute to enable or disable truncation.
     */
    @Input({ transform: booleanAttribute }) isTruncate = false;

    /**
     * The maximum width for truncation in pixels.
     * This property is coerced to a number.
     */
    @Input({ transform: coerceNumberProperty })
    set truncateLength(value: number) {
        this._truncateLength = value;
    }

    private _truncateLength = 250;

    private truncateElement: HTMLElement | null = null;
    private truncationCSSStyle: string;
    private originalCSS: string;
    private takeDefaultCSSStyleOnce = true;

    ngAfterViewInit(): void {
        this.initializeElement();
        this.truncate();
    }

    ngOnChanges(): void {
        this.truncate();
    }

    /**
     * Initializes the element and captures its original CSS style.
     * This is done only once to ensure we can revert back to the original style if truncation is disabled.
     */
    private initializeElement(): void {
        this.truncateElement = this.elementRef.nativeElement;
        if (this.truncateElement && this.takeDefaultCSSStyleOnce) {
            this.originalCSS = this.truncateElement.style.cssText;
            this.takeDefaultCSSStyleOnce = false;
        }
    }

    /**
     * Applies the truncation CSS style to the element if truncation is enabled.
     * Reverts to the original CSS style if truncation is disabled.
     */
    private truncate(): void {
        if (!this.truncateElement) {
            return;
        }

        this.truncationCSSStyle = `${this.originalCSS} max-width: ${this._truncateLength}px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;
        const cssText = this.isTruncate ? this.truncationCSSStyle : this.originalCSS;

        this.renderer.setAttribute(this.truncateElement, 'style', cssText);
    }
}
