import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { kbqInjectNativeElement, PopUpPlacements, PopUpTriggers } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqNavbarFocusableItem, KbqNavbarRectangleElement, KbqNavbarTitle } from './navbar-item.component';

@Component({
    selector: 'kbq-navbar-brand, [kbq-navbar-brand]',
    exportAs: 'kbqNavbarBrand',
    template: `
        <ng-content />
    `,
    styleUrls: [
        './navbar-brand.scss'
    ],
    host: {
        class: 'kbq-navbar-brand',
        '[class.kbq-navbar-brand_long-title]': 'longTitle',
        '[class.kbq-navbar-brand_link]': 'isLink'
    }
})
export class KbqNavbarBrand extends KbqTooltipTrigger implements AfterContentInit {
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly rectangleElement = inject(KbqNavbarRectangleElement);
    /** @docs-private */
    protected readonly navbarFocusableItem = inject(KbqNavbarFocusableItem);

    /** @docs-private */
    @ContentChild(KbqNavbarTitle) title: KbqNavbarTitle;

    /** alternative display of the brand name in two lines */
    @Input() longTitle: boolean = false;

    /** text that will be displayed in the tooltip. By default, the text is taken from kbq-navbar-title. */
    @Input()
    get collapsedText(): string {
        return this._collapsedText;
    }

    set collapsedText(value: string) {
        this._collapsedText = value;

        this.updateTooltip();
    }

    private _collapsedText: string;

    get isLink(): boolean {
        return this.nativeElement.tagName === 'A';
    }

    /** @docs-private */
    get croppedText(): string {
        const croppedTitleText = this.title?.isOverflown ? this.titleText : '';

        return `${croppedTitleText}`;
    }

    /** @docs-private */
    get hasCroppedText(): boolean {
        return !!this.title?.isOverflown;
    }

    /** @docs-private */
    get titleText(): string | null {
        return this.collapsedText || this.title?.text || null;
    }

    /** @docs-private */
    get disabled(): boolean {
        if (this._disabled !== undefined) {
            return this._disabled;
        }

        return !this.collapsed && !this.hasCroppedText;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    /** @docs-private */
    get collapsed(): boolean {
        return this._collapsed ?? this.rectangleElement.collapsed;
    }

    set collapsed(value: boolean) {
        if (this._collapsed !== value) {
            this._collapsed = value;

            this.updateTooltip();
        }
    }

    private _collapsed = false;

    constructor() {
        super();

        this.rectangleElement.state.pipe(takeUntilDestroyed()).subscribe(() => {
            this.collapsed = this.rectangleElement.collapsed;

            this.changeDetectorRef.detectChanges();
        });

        this._trigger = `${PopUpTriggers.Hover}`;

        this.navbarFocusableItem.setTooltip(this);

        this.arrow = false;
        this.offset = 0;

        // A brand that is not a link has nothing to activate: it is kept out of the roving focus order, but
        // not announced or styled as disabled.
        this.navbarFocusableItem.decorative = !this.isLink;

        // A disabled navbar item takes `pointer-events: none`, which on a brand would also stop the tooltip a
        // collapsed brand depends on. Capturing on the host runs ahead of every listener of the link, `RouterLink`
        // included.
        const unlisten = this.renderer.listen(
            this.nativeElement,
            'click',
            (event: MouseEvent) => this.preventDisabledActivation(event),
            { capture: true }
        );

        this.destroyRef.onDestroy(unlisten);
    }

    ngAfterContentInit(): void {
        this.updateTooltip();
    }

    private preventDisabledActivation(event: MouseEvent): void {
        if (!this.navbarFocusableItem.explicitlyDisabled) return;

        event.preventDefault();
        event.stopImmediatePropagation();
    }

    private updateTooltip(): void {
        if (this.collapsed) {
            this.content = `${this.titleText || ''}`;
        } else if (!this.collapsed && this.hasCroppedText) {
            this.content = this.croppedText;
        }

        if (this.rectangleElement.vertical) {
            this.placement = PopUpPlacements.Right;
        }

        this.changeDetectorRef.markForCheck();
    }
}
