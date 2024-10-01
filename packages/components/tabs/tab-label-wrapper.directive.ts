import { AfterViewInit, ContentChild, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@koobiq/components/core';
import { KbqTab } from './tab.component';

// Boilerplate for applying mixins to KbqTabLabelWrapper.
/** @docs-private */
export class KbqTabLabelWrapperBase {}

/** @docs-private */
export const KbqTabLabelWrapperMixinBase: CanDisableCtor & typeof KbqTabLabelWrapperBase =
    mixinDisabled(KbqTabLabelWrapperBase);

/**
 * Used in the `kbq-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
    selector: '[kbqTabLabelWrapper]',
    inputs: ['disabled'],
    host: {
        '[class.kbq-disabled]': 'disabled',
        '[attr.disabled]': 'disabled || null'
    }
})
export class KbqTabLabelWrapper extends KbqTabLabelWrapperMixinBase implements CanDisable, AfterViewInit {
    @ContentChild('labelContent') labelContent: ElementRef;

    @Input() tab: KbqTab;

    constructor(
        public elementRef: ElementRef,
        private renderer: Renderer2
    ) {
        super();
    }

    ngAfterViewInit(): void {
        this.addClassModifierForIcons(Array.from(this.elementRef.nativeElement.querySelectorAll('.kbq-icon')));
    }

    /** Sets focus on the wrapper element */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    getOffsetLeft(): number {
        return this.elementRef.nativeElement.offsetLeft;
    }

    getOffsetWidth(): number {
        return this.elementRef.nativeElement.offsetWidth;
    }

    checkOverflow() {
        this.tab.overflowTooltipTitle = this.isOverflown() ? this.getInnerText() : '';
    }

    isOverflown() {
        return this.labelContent.nativeElement.scrollWidth > this.labelContent.nativeElement.clientWidth;
    }

    getInnerText() {
        return this.labelContent.nativeElement.innerText;
    }

    private addClassModifierForIcons(icons: HTMLElement[]) {
        const twoIcons = 2;
        const [firstIconElement, secondIconElement] = icons;

        if (icons.length === 1) {
            const COMMENT_NODE = 8;

            if (firstIconElement.nextSibling && firstIconElement.nextSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'kbq-icon_left');
                this.renderer.addClass(this.elementRef.nativeElement, 'kbq-tab-label_with-icon-left');
            }

            if (firstIconElement.previousSibling && firstIconElement.previousSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'kbq-icon_right');
                this.renderer.addClass(this.elementRef.nativeElement, 'kbq-tab-label_with-icon-right');
            }
        } else if (icons.length === twoIcons) {
            this.renderer.addClass(firstIconElement, 'kbq-icon_left');
            this.renderer.addClass(secondIconElement, 'kbq-icon_right');
            this.renderer.addClass(this.elementRef.nativeElement, 'kbq-tab-label_with-icon-left');
            this.renderer.addClass(this.elementRef.nativeElement, 'kbq-tab-label_with-icon-right');
        }
    }
}
