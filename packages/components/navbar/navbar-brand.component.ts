import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    afterNextRender,
    booleanAttribute,
    ChangeDetectorRef,
    Component,
    computed,
    contentChild,
    DestroyRef,
    effect,
    inject,
    Injector,
    input,
    signal,
    Signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { kbqInjectNativeElement, PopUpPlacements, PopUpTriggers } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { distinctUntilChanged, EMPTY, from, map, merge, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { KbqNavbarFocusableItem, KbqNavbarRectangleElement, KbqNavbarTitle } from './navbar-item.component';

/** Switches the brand title to the compact two-line presentation. */
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
        [`[class.${LONG_TITLE_CLASS}]`]: 'longTitleEnabled()',
        '[class.kbq-navbar-brand_link]': 'isLink',
        '[attr.aria-label]': 'resolvedAriaLabel'
    },
    // Composition, not inheritance: the brand owns a tooltip, it is not one. Only the tooltip inputs that make
    // sense on a brand are re-exposed.
    hostDirectives: [
        {
            directive: KbqTooltipTrigger,
            inputs: [
                'kbqTooltip',
                'kbqTooltipClass',
                'kbqTooltipColor',
                'kbqTooltipOffset',
                'kbqTrigger',
                'kbqPlacement',
                'kbqEnterDelay',
                'kbqLeaveDelay',
                'kbqVisible'
            ],
            outputs: [
                'kbqVisibleChange',
                'kbqPlacementChange'
            ]
        }
    ],
    exportAs: 'kbqNavbarBrand'
})
export class KbqNavbarBrand implements AfterContentInit {
    /** @docs-private */
    protected readonly nativeElement = kbqInjectNativeElement();
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly rectangleElement = inject(KbqNavbarRectangleElement);
    /** @docs-private */
    protected readonly navbarFocusableItem = inject(KbqNavbarFocusableItem);
    /** @docs-private */
    readonly tooltip = inject(KbqTooltipTrigger, { self: true });

    private readonly isBrowser = inject(Platform).isBrowser;
    private readonly resizeObserver = inject(SharedResizeObserver);
    private readonly contentObserver = inject(ContentObserver);
    private readonly document = inject(DOCUMENT);
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);

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
    readonly collapsedText = input<string>('');

    /**
     * Explicitly enables or disables the brand's tooltip.
     *
     * Left unset, the tooltip is enabled exactly when the title cannot be read from the brand itself — the
     * navbar is collapsed, or the title is clipped.
     */
    readonly tooltipDisabled = input<boolean | undefined, unknown>(undefined, {
        alias: 'kbqTooltipDisabled',
        transform: (value: unknown) => (value === undefined ? undefined : booleanAttribute(value))
    });

    /** Whether the brand is rendered as a native link. */
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
        return this.collapsedText() || this.title()?.text || null;
    }

    /** Whether the brand is rendered in its collapsed (logo-only) form. @docs-private */
    readonly collapsed: Signal<boolean> = this.rectangleElement.collapsedState;

    /** Accessible name of the brand. Needed when the brand renders nothing but a logo. */
    readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

    /**
     * A collapsed brand shows nothing but its logo, and a tooltip is a transient overlay — never an accessible
     * name. The name is therefore published on the element itself, unless the consumer named it already.
     */
    protected get resolvedAriaLabel(): string | null {
        return this.ariaLabel() ?? (this.collapsed() ? this.titleText : null);
    }

    constructor() {
        this.rectangleElement.state.pipe(takeUntilDestroyed()).subscribe(() => {
            this.updateTooltip();

            this.changeDetectorRef.markForCheck();
        });

        this.tooltip.arrow = false;
        this.tooltip.offset = 0;

        // A brand tooltip stands in for a title that cannot be read from the element itself, so it opens on
        // hover only; keyboard focus surfaces it through `KbqNavbarFocusableItem.focus()`.
        this.tooltip.trigger = `${PopUpTriggers.Hover}`;

        this.navbarFocusableItem.setTooltip(this.tooltip);

        effect(() => {
            // Re-read the reactive inputs the tooltip content depends on.
            this.collapsedText();
            this.tooltipDisabled();
            this.collapsed();

            this.updateTooltip();
        });

        afterNextRender(() => this.observeLongTitle());
    }

    /** @docs-private */
    ngAfterContentInit(): void {
        // A brand that is neither a link nor a wrapper around something interactive is decorative, and only
        // then is it kept out of the roving focus order. Deciding this here and not in the constructor is what
        // makes the projected content visible at all; deciding it from `isLink` alone used to disable every
        // `<div kbq-navbar-brand>`, however interactive its content was.
        if (!this.navbarFocusableItem.disabled) {
            this.navbarFocusableItem.disabled = !this.isLink && !this.navbarFocusableItem.nestedElement;
        }

        this.updateTooltip();
    }

    private updateTooltip(): void {
        if (this.collapsed()) {
            this.tooltip.content = `${this.titleText || ''}`;
        } else if (this.hasCroppedText) {
            this.tooltip.content = this.croppedText;
        }

        // A fully visible title needs no tooltip; a collapsed or clipped one is the only way to read it.
        this.tooltip.disabled = this.tooltipDisabled() ?? (!this.collapsed() && !this.hasCroppedText);

        if (this.rectangleElement.isVertical()) {
            this.tooltip.tooltipPlacement = PopUpPlacements.Right;
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

        // Continuous, noisy sources - coalesce them.
        merge(resize$, content$, fonts$)
            .pipe(debounceTime(this.debounceInterval), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.updateAutoLongTitle());

        // Expanding is a discrete event, and a collapsed title is `display: none` - so the first expand is the
        // first chance to measure at all. Debouncing it paints the default presentation for the whole window
        // first. Measuring synchronously here would be just as wrong: `.kbq-collapsed` and the container's
        // width class are written by the change detection pass that *follows* this emission, so the read would
        // still see a `display: none` title inside a collapsed container. Render hooks run after that write and
        // before the browser paints, so the compact presentation lands on the very first frame.
        //
        // `mixedReadWrite` and not `read`: `measureNeedsLongTitle()` takes the class off around its read and
        // puts it back, and `read` is the phase documented to never write. Splitting the two across `write` and
        // `read` is not an option either - they are one indivisible measurement.
        this.rectangleElement.state
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() =>
                afterNextRender({ mixedReadWrite: () => this.updateAutoLongTitle() }, { injector: this.injector })
            );
    }

    private updateAutoLongTitle(): void {
        this.autoLongTitle.set(this.measureNeedsLongTitle());

        // The clamp state feeds into `hasCroppedText`, which the tooltip's content depends on - refresh it
        // so a title that becomes clamped after the initial render doesn't show stale/empty tooltip content.
        this.updateTooltip();
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
