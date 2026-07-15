import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    afterNextRender,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    inject,
    Input,
    input,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { kbqInjectNativeElement, PopUpPlacements, PopUpTriggers } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { distinctUntilChanged, EMPTY, from, map, merge, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { KbqNavbarFocusableItem, KbqNavbarRectangleElement, KbqNavbarTitle } from './navbar-item.component';

/** Switches the brand title to the compact two-line presentation. Mirrored in the host binding below. */
const LONG_TITLE_CLASS = 'kbq-navbar-brand_long-title';

@Component({
    selector: 'kbq-navbar-brand, [kbq-navbar-brand]',
    template: `
        <ng-content />
    `,
    styleUrls: [
        './navbar-brand.scss'
    ],
    host: {
        class: 'kbq-navbar-brand',
        '[class.kbq-navbar-brand_long-title]': 'longTitleEnabled()',
        '[class.kbq-navbar-brand_link]': 'isLink'
    },
    exportAs: 'kbqNavbarBrand'
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

    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);
    private readonly document = inject(DOCUMENT);

    private readonly debounceInterval = 100;

    /** @docs-private */
    readonly title = contentChild(KbqNavbarTitle);

    /** Whether the title has been measured as not fitting into a single line. */
    private readonly autoLongTitle = signal(false);

    /**
     * Alternative display of the brand name in two lines.
     *
     * @deprecated The mode is now detected automatically when the title does not fit into a single line.
     * Leave unset for auto-detection; `true` and `false` force the mode on and off respectively.
     * Will be removed in the next major release.
     */
    readonly longTitle = input<boolean>();

    /** @docs-private */
    protected readonly longTitleEnabled = computed(() => this.longTitle() ?? this.autoLongTitle());

    /** text that will be displayed in the tooltip. By default, the text is taken from kbq-navbar-title. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
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
        const croppedTitleText = this.hasCroppedText ? this.titleText : '';

        return `${croppedTitleText}`;
    }

    /** @docs-private */
    get hasCroppedText(): boolean {
        const title = this.title();

        return !!title && (title.isOverflown || title.isClamped);
    }

    /** @docs-private */
    get titleText(): string | null {
        return this.collapsedText || this.title()?.text || null;
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

        this.navbarFocusableItem.disabled = !this.isLink;

        afterNextRender(() => this.observeLongTitle());
    }

    ngAfterContentInit(): void {
        this.updateTooltip();
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

    private observeLongTitle(): void {
        if (!this.isBrowser) return;

        this.updateAutoLongTitle();

        const host = this.nativeElement;

        const resize$ = this.resizeObserver.observe(host).pipe(
            map(() => host.clientWidth),
            distinctUntilChanged()
        );

        const content$ = this.contentObserver.observe(host);

        const fontSet: FontFaceSet | undefined = this.document.fonts;
        const fonts$: Observable<unknown> = fontSet ? from(fontSet.ready) : EMPTY;

        const state$ = this.rectangleElement.state;

        merge(resize$, content$, fonts$, state$)
            .pipe(debounceTime(this.debounceInterval), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.updateAutoLongTitle());
    }

    private updateAutoLongTitle(): void {
        // Setting the signal is enough: the host binding reads it, which marks this view dirty on its own.
        this.autoLongTitle.set(this.measureNeedsLongTitle());
    }

    /**
     * Measures whether the title fits into a single line in the *default* presentation.
     *
     * Removing and restoring the class within a single task is safe: the browser does not paint mid-task, and
     * Angular's host binding only writes to the DOM when its value changes, which it does not here. Both rely
     * on there being no CSS transition on the title - add one and this starts to flicker.
     */
    private measureNeedsLongTitle(): boolean {
        const title = this.title();

        // A collapsed title is `display: none`, so it measures as 0 - keep the last known value instead.
        if (!title || this.rectangleElement.collapsed) {
            return this.autoLongTitle();
        }

        const host = this.nativeElement;
        const applied = host.classList.contains(LONG_TITLE_CLASS);

        if (applied) host.classList.remove(LONG_TITLE_CLASS);

        const overflown = title.isOverflown;

        if (applied) host.classList.add(LONG_TITLE_CLASS);

        return overflown;
    }
}
