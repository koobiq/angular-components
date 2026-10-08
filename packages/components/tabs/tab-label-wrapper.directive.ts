import {
    AfterViewInit,
    booleanAttribute,
    contentChild,
    Directive,
    ElementRef,
    inject,
    input,
    OnChanges,
    Renderer2,
    SimpleChanges
} from '@angular/core';
import { KbqTab } from './tab.component';

/**
 * Used in the `kbq-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
    selector: '[kbqTabLabelWrapper]',
    host: {
        '[class.kbq-disabled]': 'disabled',
        '[attr.disabled]': 'disabled || null'
    }
})
export class KbqTabLabelWrapper implements OnChanges, AfterViewInit {
    elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private renderer = inject(Renderer2);

    private readonly labelContentQuery = contentChild<ElementRef>('labelContent');

    /** The element of the label content, measured to tell whether the label overflows. */
    get labelContent(): ElementRef {
        return this.labelContentQuery()!;
    }

    /** @docs-private */
    readonly tabInput = input<KbqTab | undefined>(undefined, { alias: 'tab' });

    /** @docs-private */
    readonly disabledInput = input<boolean | undefined, boolean | string | null | undefined>(undefined, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    tab: KbqTab;

    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    ngOnChanges(changes: SimpleChanges): void {
        // A bound input is handed to its member as the decorator input did; unbound, it leaves what code wrote.
        if (changes['tabInput']) {
            const tab = this.tabInput();

            if (tab !== undefined) this.tab = tab;
        }

        if (changes['disabledInput']) {
            const disabled = this.disabledInput();

            if (disabled !== undefined) this.disabled = disabled;
        }
    }

    ngAfterViewInit(): void {
        this.addClassModifierForIcons(Array.from(this.elementRef.nativeElement.querySelectorAll('.kbq-icon')));
    }

    /**
     * Sets focus on the wrapper element.
     *
     * `preventScroll: true`: `FocusKeyManager.setActiveItem` calls this itself, right after (and
     * unconditionally on) the `change` emission that runs `KbqPaginatedTabHeader.setTabFocus` — so
     * without the guard here too, that call's own `preventScroll: true` is immediately undone by
     * this one, and an overflowing header double-jumps (native scroll-into-view, then the
     * paginator-aware `scrollCorrection`) on every arrow-key press.
     */
    focus(): void {
        this.elementRef.nativeElement.focus({ preventScroll: true });
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
