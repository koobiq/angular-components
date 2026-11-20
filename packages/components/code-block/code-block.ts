import { A11yModule, FocusMonitor, type FocusOrigin } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterEveryRender,
    afterNextRender,
    type AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    Injector,
    input,
    linkedSignal,
    numberAttribute,
    output,
    type Provider,
    SecurityContext,
    signal,
    TemplateRef,
    untracked,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { debounceTime, filter, fromEvent, map, merge, type Observable, take } from 'rxjs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    KBQ_WINDOW,
    kbqAnimationsDisabled,
    type KbqCodeBlockLocaleConfiguration,
    KbqComponentColors,
    type KbqDeepPartial,
    kbqLocaleConfigurationOverrideProvider,
    KbqLocaleOverridesDirective,
    kbqOptionalNumberAttribute,
    KbqOverflowShadowContainer,
    KbqOverflowShadowTop,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { type KbqScrollbarScrollToOptions, KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule, type KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqCodeBlockHighlight } from './code-block-highlight';
import type { KbqCodeBlockFile, KbqCodeBlockLineRange, KbqTabLinkTemplateContext } from './types';

/** Localization configuration provider. */
export const KBQ_CODE_BLOCK_LOCALE_CONFIGURATION = new InjectionToken<KbqCodeBlockLocaleConfiguration>(
    'KbqCodeBlockLocaleConfiguration',
    { factory: () => ruRULocaleData.codeBlock }
);

/**
 * Utility provider for `KBQ_CODE_BLOCK_LOCALE_CONFIGURATION`. Only the strings you pass are overridden;
 * the rest keep following the active locale.
 */
export const kbqCodeBlockLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqCodeBlockLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('codeBlock', configuration);

/** Fallback file name for code block if file name is not specified. */
export const KBQ_CODE_BLOCK_FALLBACK_FILE_NAME = new InjectionToken<string>('KBQ_CODE_BLOCK_FALLBACK_FILE_NAME', {
    factory: () => 'code'
});

/** Utility provider for `KBQ_CODE_BLOCK_FALLBACK_FILE_NAME`. */
export const kbqCodeBlockFallbackFileNameProvider = (fileName: string): Provider => ({
    provide: KBQ_CODE_BLOCK_FALLBACK_FILE_NAME,
    useValue: fileName
});

/** Default options for `kbq-code-block`. */
export type KbqCodeBlockDefaultOptions = Partial<{
    /** Whether the actionbar should remain visible when tabs are hidden. Defaults to `false`. */
    alwaysShowActionbar: boolean;

    /** Whether to display line numbers. Defaults to `false`. */
    lineNumbers: boolean;
}>;

/** Injection token used to configure the default options for all `kbq-code-block` components. */
export const KBQ_CODE_BLOCK_DEFAULT_OPTIONS = new InjectionToken<KbqCodeBlockDefaultOptions>(
    'KBQ_CODE_BLOCK_DEFAULT_OPTIONS'
);

/** Utility provider for `KBQ_CODE_BLOCK_DEFAULT_OPTIONS`. */
export const kbqCodeBlockDefaultOptionsProvider = (options: KbqCodeBlockDefaultOptions): Provider => ({
    provide: KBQ_CODE_BLOCK_DEFAULT_OPTIONS,
    useValue: options
});

/** Marks a template as a custom tab link. */
@Directive({
    selector: 'ng-template[kbqCodeBlockTabLinkContent]',
    exportAs: 'kbqCodeBlockTabLinkContent'
})
export class KbqCodeBlockTabLinkContent {}

/**
 * Component which highlights blocks of code.
 */
@Component({
    selector: 'kbq-code-block',
    imports: [
        KbqTabsModule,
        KbqButtonModule,
        KbqCodeBlockHighlight,
        A11yModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqScrollbarViewport,
        NgTemplateOutlet,
        KbqOverflowShadowContainer,
        KbqOverflowShadowTop
    ],
    templateUrl: './code-block.html',
    styleUrls: ['./code-block.scss', './code-block-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-code-block',
        '[class.kbq-code-block_filled]': 'filled()',
        '[class.kbq-code-block_outline]': '!filled()',
        '[class.kbq-code-block_hide-line-numbers]': '!lineNumbers()',
        '[class.kbq-code-block_hide-tabs]': 'tabsHidden()',
        '[class.kbq-code-block_no-border]': 'noBorder() || filled()',
        '[class.kbq-code-block_show-actionbar]': 'actionbarVisible()',
        '[class.kbq-code-block_soft-wrap]': 'softWrap() || hasCollapseControl()',
        '[class.kbq-code-block_view-all]': 'viewAll()',
        '[class.kbq-code-block_line-links]': '!!activeFile()?.id',
        '[class.kbq-code-block_line-collapse]': '!!collapsedLineCount()',
        '[class.kbq-code-block_collapsible]': 'hasCollapseControl()',
        '[class.kbq-code-block_scrolled-horizontally]': 'horizontalContentScrolled()'
    },
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ],
    exportAs: 'kbqCodeBlock'
})
export class KbqCodeBlock implements AfterViewInit {
    private readonly copyButtonTooltip = viewChild<KbqTooltipTrigger>('copyButtonTooltip');
    private readonly lineCopyTooltip = viewChild<KbqTooltipTrigger>('lineCopyTooltip');
    private readonly defaultOptions = inject(KBQ_CODE_BLOCK_DEFAULT_OPTIONS, { optional: true });
    private readonly animationsDisabled = kbqAnimationsDisabled();

    private readonly highlight = viewChild(KbqCodeBlockHighlight);

    private readonly scrollbarViewport = viewChild.required(KbqScrollbarViewport);

    /** Memoized so every waiter shares one `toObservable` effect instead of installing one each. */
    private highlightPending?: Observable<boolean>;

    private readonly preElementRef = viewChild<ElementRef<HTMLElement>>('codeBlockPre');

    private readonly codeElementRef = viewChild<ElementRef<HTMLElement>>('codeBlockCode');
    /** @docs-private */
    protected readonly horizontalContentScrolled = signal(false);

    /**
     * Whether the code runs past `maxHeight`, or `undefined` until the browser has measured it. The server
     * never measures, and its markup keeps the limit so that a block hydrated later holds its height.
     *
     * @docs-private
     */
    protected readonly contentExceedsMaxHeight = signal<boolean | undefined>(undefined);

    /** @docs-private */
    protected readonly tabLinkTemplate = contentChild<
        KbqCodeBlockTabLinkContent,
        TemplateRef<KbqTabLinkTemplateContext>
    >(KbqCodeBlockTabLinkContent, { read: TemplateRef });

    /**
     * Number of initial source lines shown while collapsed. Collapsible blocks wrap long lines and do not scroll.
     * Defaults to `undefined` (uses the existing `maxHeight` behavior).
     */
    readonly collapsedLineCount = input<number | undefined, number | string | null | undefined>(undefined, {
        transform: (value: unknown) => {
            const count = numberAttribute(value);

            return Number.isInteger(count) && count > 0 ? count : undefined;
        }
    });

    /**
     * Maximum scrollable code area height. Ignored when the block has an expand/collapse button.
     * Defaults to `undefined` (unlimited).
     */
    readonly viewportMaxHeight = input<number | undefined, number | string | null | undefined>(undefined, {
        transform: kbqOptionalNumberAttribute
    });

    /** @docs-private */
    protected readonly lineNavigationActive = linkedSignal(() => {
        this.activeFile();

        return false;
    });

    private readonly codeRevision = signal(0);
    /** @docs-private */
    protected readonly selectedRange = linkedSignal<KbqCodeBlockLineRange | undefined>(() => {
        this.activeFile();

        return undefined;
    });
    private readonly selectionAnchor = linkedSignal(() => {
        this.activeFile();

        return 1;
    });
    private readonly activeLine = linkedSignal(() => {
        this.activeFile();

        return 1;
    });
    private readonly legacyVisibleLineCount = signal<number | undefined>(undefined);
    private readonly sourceLineCount = computed(() => {
        const content = this.activeFile()?.content ?? '';

        if (!content) return 0;
        const lines = content.split(/\r\n|\r|\n/);

        return lines.length > 1 && !lines[lines.length - 1] ? lines.length - 1 : lines.length;
    });
    private readonly availableLineCount = computed(() =>
        this.viewAll()
            ? this.sourceLineCount()
            : Math.min(
                  this.collapsedLineCount() ?? this.legacyVisibleLineCount() ?? this.sourceLineCount(),
                  this.sourceLineCount()
              )
    );
    /** @docs-private */
    protected readonly hasLineCollapse = computed(
        () => !!this.collapsedLineCount() && this.sourceLineCount() > this.collapsedLineCount()!
    );
    /** Whether the block has an expand/collapse control. @docs-private */
    protected readonly hasCollapseControl = computed(
        () => this.hasLineCollapse() || (!this.collapsedLineCount() && !!this.contentExceedsMaxHeight())
    );
    /** Height limit for clipping collapsed content or scrolling a block without a disclosure. @docs-private */
    protected readonly codeContentMaxHeight = computed(() => {
        if (this.hasCollapseControl()) return this.hasLineCollapse() ? null : this.calculatedMaxHeight();

        return this.viewportMaxHeight() || this.calculatedMaxHeight();
    });
    /** @docs-private */
    protected readonly selectionPartlyHidden = computed(
        () => (this.selectedRange()?.end ?? 0) > this.availableLineCount()
    );
    /** @docs-private */
    protected readonly manualCopyText = signal<string | undefined>(undefined);
    private readonly manualCopyDialog = viewChild<ElementRef<HTMLDialogElement>>('manualCopyDialog');
    private readonly manualCopyField = viewChild<ElementRef<HTMLTextAreaElement>>('manualCopyField');
    private copyTrigger?: HTMLElement;
    private copyTooltipTimer?: ReturnType<typeof setTimeout>;
    private lineTooltipHideTimer?: ReturnType<typeof setTimeout>;
    private lineTooltipShowTimer?: ReturnType<typeof setTimeout>;
    private lastHorizontalScrollOffset?: number;
    private lineTooltipButton?: HTMLButtonElement;
    private copiedLineButton?: HTMLElement;
    private pendingLineFocus?: number;
    private lastFragment?: string;
    private lastFragmentFile?: KbqCodeBlockFile;

    /** Whether to display line numbers. Defaults to `lineNumbers` of `KBQ_CODE_BLOCK_DEFAULT_OPTIONS`, or `false`. */
    readonly lineNumbers = input(this.defaultOptions?.lineNumbers ?? false, { transform: booleanAttribute });

    /** Whether the code block should be filled. */
    readonly filled = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Added soft wrap toggle button.  */
    readonly canToggleSoftWrap = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Backing input of `softWrap`. Bind through the `softWrap` attribute; read and write the signal.
     *
     * `model()` cannot carry the `booleanAttribute` transform a valueless attribute needs, and an input
     * is read-only while `toggleSoftWrap()` writes this as well as the binding - hence the pair.
     *
     * @docs-private
     */
    readonly softWrapInput = input(false, { alias: 'softWrap', transform: booleanAttribute });

    /** Whether sequences of whitespace should be preserved. */
    readonly softWrap = linkedSignal(() => this.softWrapInput());

    /**
     * Output to support two-way binding on `[(softWrap)]` property.
     */
    readonly softWrapChange = output<boolean>();

    /**
     * Backing input of `viewAll`, in the same shape as `softWrapInput`.
     *
     * @docs-private
     */
    readonly viewAllInput = input(false, { alias: 'viewAll', transform: booleanAttribute });

    /**
     * Allows to view all the code, otherwise it will be hidden.
     * Works with `maxHeight` or `collapsedLineCount`.
     */
    readonly viewAll = linkedSignal(() => this.viewAllInput());

    /**
     * Output to support two-way binding on `[(viewAll)]` property.
     */
    readonly viewAllChange = output<boolean>();

    /**
     * Maximum height of the code block content, other parts will be hidden.
     * Can be toggled by `viewAll` property.
     */
    readonly maxHeight = input<number | undefined, unknown>(undefined, {
        transform: kbqOptionalNumberAttribute
    });

    /**
     * @docs-private
     */
    protected readonly calculatedMaxHeight = computed<number | null>(() => {
        const maxHeight = this.maxHeight();

        // Code that fits is left at its natural height: clipped at the limit it would scroll by its own
        // bottom padding, with nothing hidden to reveal and no "view all" button to reveal it.
        return maxHeight && maxHeight > 0 && !this.viewAll() && this.contentExceedsMaxHeight() !== false
            ? maxHeight
            : null;
    });

    /**
     * Backing input of `canDownload`.
     *
     * @docs-private
     */
    readonly canDownloadInput = input(false, { alias: 'canDownload', transform: booleanAttribute });

    /** Added download code button. */
    readonly canDownload = linkedSignal(() => this.canDownloadInput());

    /** Added copy code button. */
    readonly canCopy = input<boolean, unknown>(true, { transform: booleanAttribute });

    /** Whether the actionbar should remain visible when tabs are hidden. */
    readonly alwaysShowActionbar = input<boolean, unknown>(this.defaultOptions?.alwaysShowActionbar ?? false, {
        transform: booleanAttribute
    });

    /**
     * Backing input of `files`.
     *
     * @docs-private
     */
    readonly filesInput = input<KbqCodeBlockFile[]>([], { alias: 'files' });

    /** Files to display. */
    // TODO: mark as `required`.
    readonly files = linkedSignal(() => this.filesInput());

    /**
     * Backing input of `activeFileIndex`. `numberAttribute` yields NaN for anything not cleanly numeric,
     * and an unbound `index?: number` reaches it as `undefined`, so the transform floors both at 0 rather
     * than letting NaN through a signal typed `number`.
     *
     * @docs-private
     */
    readonly activeFileIndexInput = input(0, {
        alias: 'activeFileIndex',
        transform: (value: unknown) => {
            const index = numberAttribute(value);

            return Number.isInteger(index) && index >= 0 ? index : 0;
        }
    });

    /** Defines which file (index) is active. */
    readonly activeFileIndex = linkedSignal(() => this.activeFileIndexInput());

    /**
     * Index of the file actually rendered. `files` and `activeFileIndex` are written one after the other,
     * so either order leaves the pair briefly inconsistent: the render falls back to the first file rather
     * than resetting the input, which would write back into a `[(activeFileIndex)]` mid-update.
     *
     * @docs-private
     */
    protected readonly renderedFileIndex = computed(() => {
        const index = this.activeFileIndex();

        return index < this.files().length ? index : 0;
    });

    /**
     * The file being rendered, or `undefined` while `files` is empty.
     *
     * @docs-private
     */
    protected readonly activeFile = computed<KbqCodeBlockFile | undefined>(
        () => this.files()[this.renderedFileIndex()]
    );

    /**
     * Output to support two-way binding on `[(activeFileIndex)]` property.
     */
    readonly activeFileIndexChange = output<number>();

    /** Whether to hide border. */
    readonly noBorder = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Backing input of `hideTabs`.
     *
     * @docs-private
     */
    readonly hideTabsInput = input(false, { alias: 'hideTabs', transform: booleanAttribute });

    /**
     * Whether to hide header tabs. A single file without a filename hides them regardless - read
     * `tabsHidden` for what the header actually does.
     * Makes actionbar floating if tabs are hidden.
     */
    readonly hideTabs = linkedSignal(() => this.hideTabsInput());

    /**
     * A lone file with no filename has nothing to label a tab with, so the bar is hidden whatever was
     * bound. Derived rather than written into `hideTabs`: the write latched the bar off for the life of
     * the component, so naming the files later never brought it back, and it re-emitted `hideTabsChange`
     * on every `files` assignment.
     *
     * @docs-private
     */
    readonly tabsHidden = computed(() => {
        const files = this.files();

        return this.hideTabs() || (files.length === 1 && !files[0]?.filename);
    });
    private readonly actionbarHovered = signal(false);

    /**
     * Output to support two-way binding on `[(hideTabs)]` property.
     */
    readonly hideTabsChange = output<boolean>();

    /**
     * Component locale configuration.
     *
     * @docs-private
     */
    protected readonly localeConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'codeBlock',
        KBQ_CODE_BLOCK_LOCALE_CONFIGURATION
    );

    /**
     * Whether the code content scrolls while nothing collapses it, which leaves keyboard users a way to scroll it.
     * Collapsed under `maxHeight` it is clipped instead, and the "view all" button is the way in.
     */
    private get canCodeContentBeFocused(): boolean {
        return !this.calculatedMaxHeight() && this.hasScroll(this.scrollbarViewport().getNativeElement());
    }

    /**
     * @docs-private
     */
    protected readonly componentColor = KbqComponentColors;

    /**
     * @docs-private
     */
    protected readonly buttonStyle = KbqButtonStyles;

    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);
    private readonly platform = inject(Platform);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly clipboard = inject(Clipboard);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly document = inject<Document>(DOCUMENT);
    private readonly sharedResizeObserver = inject(SharedResizeObserver);

    /**
     * @docs-private
     */
    protected readonly fallbackFileName = inject(KBQ_CODE_BLOCK_FALLBACK_FILE_NAME);
    private readonly window = inject(KBQ_WINDOW);

    /** @docs-private */
    protected readonly actionbarVisible = computed(
        () =>
            this.alwaysShowActionbar() ||
            this.platform.IOS ||
            this.platform.ANDROID ||
            !this.tabsHidden() ||
            this.actionbarHovered()
    );

    constructor() {
        this.trackHoverState();
        this.setupLineLinks();
        this.destroyRef.onDestroy(() => {
            clearTimeout(this.copyTooltipTimer);
            clearTimeout(this.lineTooltipHideTimer);
            clearTimeout(this.lineTooltipShowTimer);
        });

        // The template leaves the code content focusable, as the server renders it: the server cannot measure, and a
        // block that stays dehydrated under a `@defer` hydrate trigger would otherwise keep an overflow that no keyboard
        // can scroll. The browser measures in the phases of every render, so that blocks rendered together read in one
        // layout, and writes to the element directly: a binding would only catch up a round of change detection later,
        // after the hooks still to run in this render.
        if (this.platform.isBrowser) {
            afterEveryRender({
                earlyRead: () => {
                    const tabIndex = this.activeFile()?.id || this.canCodeContentBeFocused ? 0 : -1;
                    const height = this.calculatedMaxHeight();
                    let visibleLines: number | undefined;

                    if (this.activeFile()?.id && height && !this.collapsedLineCount()) {
                        const viewport = this.scrollbarViewport().getNativeElement().getBoundingClientRect();
                        const disclosure = this.elementRef.nativeElement
                            .querySelector('.kbq-code-block__view-all')
                            ?.getBoundingClientRect();
                        const bottom = Math.min(viewport.top + height, disclosure?.top ?? Infinity);

                        visibleLines = Math.max(
                            1,
                            this.codeLines().filter((line) => line.getBoundingClientRect().bottom <= bottom).length
                        );
                    }

                    return { tabIndex, visibleLines };
                },
                write: ({ tabIndex, visibleLines }) => {
                    this.legacyVisibleLineCount.set(visibleLines);
                    const element = this.scrollbarViewport().getNativeElement();

                    if (element.tabIndex !== tabIndex) element.tabIndex = tabIndex;
                    this.syncLineControls();

                    if (this.pendingLineFocus !== undefined && !this.highlight()?.pending()) {
                        const line = this.pendingLineFocus;

                        this.pendingLineFocus = undefined;
                        this.focusLine(line, true);
                    }
                }
            });
        }
    }

    ngAfterViewInit(): void {
        this.setupContentOverflowDetection();
        this.revealScrollbarOnHighlight();

        this.copyButtonTooltip()
            ?.visibleChange.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((isVisible) => {
                if (isVisible) {
                    this.copyButtonTooltip()!.content = this.localeConfiguration().copyTooltip;
                }
            });
    }

    /**
     * Toggles the `viewAll` property.
     *
     * When `viewAll` is set to `true`, the content of the code block will be
     * displayed in its entirety. When set to `false`, the content will be
     * limited to the `maxHeight` property. If the content exceeds the
     * `maxHeight`, it will be scrolled to the top and the `viewAll` button
     * will be displayed.
     */
    toggleViewAll(): void {
        this.viewAll.set(!this.viewAll());

        if (!this.viewAll()) {
            this.scrollTo({ top: 0, behavior: 'instant' });
        }

        this.activeLine.set(Math.min(this.activeLine(), this.availableLineCount()));
        this.viewAllChange.emit(this.viewAll());
    }

    /** Scrolls the code content to the specified position. */
    scrollTo(options: KbqScrollbarScrollToOptions): void {
        const scroll = () => this.scrollbarViewport().scrollTo(options);

        if (this.highlight()?.pending()) {
            this.highlightSettled().pipe(take(1)).subscribe(scroll);
        } else {
            scroll();
        }
    }

    /**
     * Toggles `softWrap` property.
     *
     * When `softWrap` is set to `true`, the content of the code block will be
     * wrapped if it exceeds the height of the component. When set to `false`
     * the content will not be wrapped.
     */
    toggleSoftWrap(): void {
        this.softWrap.set(!this.softWrap());
        this.softWrapChange.emit(this.softWrap());
    }

    /**
     * Handles the change of the selected tab by updating the active file index
     * and scrolling to the top of the scrollable content.
     *
     * @param index - The index of the newly selected tab.
     *
     * @docs-private
     */
    protected onSelectedTabChange(index: number): void {
        // Compared against the bound index rather than the rendered one: with an out-of-range binding the
        // two differ, and clicking the tab that is already on screen has to bring the input back in range.
        if (this.activeFileIndex() !== index) {
            this.activeFileIndex.set(index);
            this.activeFileIndexChange.emit(index);
            this.scrollTo({ top: 0, behavior: 'instant' });
        }
    }

    /** Tracks hover when tabs are hidden and `alwaysShowActionbar` is disabled. */
    private trackHoverState(): void {
        effect(
            (onCleanup) => {
                const hideTabs = this.tabsHidden();
                const alwaysShowActionbar = this.alwaysShowActionbar();

                this.actionbarHovered.set(false);

                if (!hideTabs || alwaysShowActionbar || this.platform.IOS || this.platform.ANDROID) return;

                // A block that comes to life under the pointer, as one hydrated on hover does, gets no `mouseenter`
                // until the pointer has left it.
                this.actionbarHovered.set(this.platform.isBrowser && this.elementRef.nativeElement.matches(':hover'));

                const subscription = merge(
                    fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter').pipe(map(() => true)),
                    fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave').pipe(map(() => false))
                )
                    .pipe(debounceTime(100))
                    .subscribe((isHovered) => {
                        this.actionbarHovered.set(isHovered);
                    });

                onCleanup(() => subscription.unsubscribe());
            },
            { injector: this.injector }
        );
    }

    /**
     * Briefly reveals the scrollbar once highlighting settles, so whether the code scrolls is answered
     * on arrival rather than only after the pointer enters the block. Switching files needs nothing of
     * its own: `onSelectedTabChange` scrolls the content back to the top, and that scroll reveals the
     * track by itself.
     *
     * A viewport with nothing to scroll paints no track, so this stays silent for code that fits.
     */
    private revealScrollbarOnHighlight(): void {
        if (!this.platform.isBrowser) return;

        this.highlightSettled()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.scrollbarViewport().flashScrollIndicators());
    }

    /**
     * Emits every time highlighting finishes. Built once and reused: `toObservable` installs an Angular
     * effect that lives as long as the injector, so creating one per call — as `scrollTo` did on every
     * tab click while a file was still highlighting — left an effect behind each time.
     */
    private highlightSettled(): Observable<boolean> {
        // Read through the query: the highlighted element lives inside `@if (activeFile())`, and a block
        // with no file has nothing to wait for.
        this.highlightPending ??= toObservable(
            computed(() => this.highlight()?.pending() ?? false),
            {
                injector: this.injector
            }
        );

        return this.highlightPending.pipe(filter((pending) => !pending));
    }

    private setupContentOverflowDetection(): void {
        if (!this.platform.isBrowser) return;

        // `maxHeight` is a signal, so the gate has to follow it: bound after init it used to leave the
        // content clipped with neither the "view all" button nor a way in from the keyboard.
        effect(
            (onCleanup) => {
                const preElement = this.preElementRef()?.nativeElement;

                this.measureContentOverflow();

                if (!this.maxHeight() || !preElement) return;

                const subscription = this.sharedResizeObserver
                    .observe(preElement)
                    .subscribe(() => this.measureContentOverflow());

                onCleanup(() => subscription.unsubscribe());
            },
            { injector: this.injector }
        );

        // Half-rendered content answers for the wrong height, so the measurement is retaken once
        // highlighting settles. Kept apart from the subscription above, which would otherwise be torn
        // down and re-created on both edges of every `pending` flip.
        effect(
            () => {
                this.highlight()?.pending();

                untracked(() => this.measureContentOverflow());
            },
            { injector: this.injector }
        );
    }

    private measureContentOverflow(): void {
        const maxHeight = this.maxHeight();
        const preElement = this.preElementRef()?.nativeElement;
        const codeElement = this.codeElementRef()?.nativeElement;

        if (!maxHeight || !preElement || !codeElement) {
            this.contentExceedsMaxHeight.set(false);

            return;
        }

        // The limit is checked against the end of the last line, not of the element: the bottom padding is
        // what gets clipped first, and clipped padding hides no code. Read from the computed style because
        // the "view all" button, once shown, deepens that padding, and measuring it would keep the button.
        const paddingBottom = parseFloat(this.window.getComputedStyle(codeElement).paddingBottom) || 0;

        this.contentExceedsMaxHeight.set(preElement.offsetHeight - paddingBottom > maxHeight);
    }

    /** Whether the element has scroll. */
    private hasScroll({ scrollHeight, scrollWidth, clientHeight, clientWidth }: HTMLElement): boolean {
        return scrollHeight > clientHeight || scrollWidth > clientWidth;
    }

    /**
     * Handles the enter keydown event on `viewAll` button.
     *
     * @docs-private
     */
    protected onViewAllEnterKeydown(event: Event): void {
        event.preventDefault();

        this.toggleViewAll();

        if (this.canCodeContentBeFocused) {
            this.focusMonitor.focusVia(this.scrollbarViewport().getNativeElement(), 'keyboard');
        }
    }

    private setupLineLinks(): void {
        effect(() => {
            this.codeRevision();
            this.activeLine();
            this.selectedRange();
            this.availableLineCount();
            this.localeConfiguration();
            this.lineNavigationActive();

            this.syncLineControls();
        });

        if (!this.platform.isBrowser) return;

        effect((onCleanup) => {
            const code = this.codeElementRef()?.nativeElement;

            if (!code) return;
            this.focusMonitor.monitor(code, true);
            onCleanup(() => this.focusMonitor.stopMonitoring(code));
        });

        effect(() => {
            this.files();
            this.restoreLineFragment();
        });
        fromEvent(this.window, 'hashchange')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.restoreLineFragment());
    }

    /** @docs-private */
    protected onCodeRendered(): void {
        const code = this.codeElementRef()?.nativeElement;
        const focusLine = code?.getAttribute('data-focus-line');

        if (focusLine) {
            this.pendingLineFocus = Number(focusLine);
            code?.removeAttribute('data-focus-line');
        }

        clearTimeout(this.lineTooltipHideTimer);
        clearTimeout(this.lineTooltipShowTimer);
        this.lineTooltipShowTimer = undefined;
        this.lineCopyTooltip()?.hideAsInactive();
        this.lineTooltipButton = undefined;
        this.codeRevision.update((revision) => revision + 1);
    }

    private codeLines(): HTMLElement[] {
        return Array.from(
            this.codeElementRef()?.nativeElement.querySelectorAll<HTMLElement>('.kbq-code-block__line') ?? []
        );
    }

    private syncLineControls(): void {
        const file = this.activeFile();

        if (!file?.id && !this.collapsedLineCount()) return;
        const selected = this.selectedRange();
        const available = this.availableLineCount();
        const active = Math.min(this.activeLine(), available);
        const rangeActionLine =
            selected && active >= selected.start && active <= selected.end ? active : selected?.start;

        for (const [index, line] of this.codeLines().entries()) {
            const number = index + 1;

            line.hidden = !!this.collapsedLineCount() && number > available;
            line.classList.toggle(
                'kbq-code-block__line_selected',
                !!selected && number >= selected.start && number <= selected.end
            );
            line.classList.toggle('kbq-code-block__line_active', number === active);
            line.classList.toggle('kbq-code-block__line_range-action', number === rangeActionLine);
            if (!file?.id) continue;

            line.id = `${file.id}-L${number}`;
            line.setAttribute('data-line', String(number));
            let gutter = line.querySelector<HTMLElement>('.kbq-code-block__gutter');

            if (!gutter) {
                gutter = this.document.createElement('span');
                gutter.className = 'kbq-code-block__gutter';

                for (const name of ['line-select', 'line-action']) {
                    const button = this.document.createElement('button');

                    button.type = 'button';
                    button.className = `kbq-code-block__${name}`;
                    button.tabIndex = -1;
                    button.setAttribute('data-line', String(number));

                    if (name === 'line-action') {
                        for (const glyph of ['link', 'check']) {
                            const icon = this.document.createElement('i');

                            icon.className = `kbq kbq-icon kbq-${glyph}_16 kbq-code-block__line-action-${glyph}`;
                            icon.classList.toggle('kbq-animations-disabled', this.animationsDisabled);
                            icon.setAttribute('aria-hidden', 'true');
                            button.appendChild(icon);
                        }
                    }

                    gutter.appendChild(button);
                }

                line.insertBefore(gutter, line.firstChild);
            }

            const select = gutter.querySelector<HTMLButtonElement>('.kbq-code-block__line-select');
            const action = gutter.querySelector<HTMLButtonElement>('.kbq-code-block__line-action');

            select?.setAttribute('aria-label', this.lineLabel(number));
            select?.setAttribute(
                'aria-pressed',
                String(!!selected && number >= selected.start && number <= selected.end)
            );
            action?.setAttribute(
                'aria-label',
                `${this.lineLocale().copyLinkText}: ${this.rangeLabel(this.lineActionRange(number))}`
            );
            action?.setAttribute('aria-description', this.lineLocale().lineNavigationHint ?? '');
            if (action) {
                action.hidden =
                    !!selected && number >= selected.start && number <= selected.end && number !== rangeActionLine;
                action.tabIndex = this.lineNavigationActive() && number === active && !action.hidden ? 0 : -1;
            }
        }
    }

    private lineActionRange(line: number): KbqCodeBlockLineRange {
        const selected = this.selectedRange();

        return selected && line >= selected.start && line <= selected.end ? selected : { start: line, end: line };
    }

    /** @docs-private */
    protected readonly lineLocale = computed(() => ({ ...ruRULocaleData.codeBlock, ...this.localeConfiguration() }));

    private lineLabel(line: number): string {
        return (this.lineLocale().selectLineText ?? '').replace('{{ line }}', String(line));
    }

    /** @docs-private */
    protected rangeLabel(range: KbqCodeBlockLineRange): string {
        return (
            (range.start === range.end ? this.lineLocale().lineText : this.lineLocale().linesText)
                ?.replace('{{ start }}', String(range.start))
                .replace('{{ end }}', String(range.end)) ?? ''
        );
    }

    private lineButton(event: Event): HTMLButtonElement | null {
        const target = event.target as HTMLElement | null;

        return target?.closest?.('button[data-line]') ?? null;
    }

    /** @docs-private */
    protected onCodeScroll(): void {
        const viewport = this.scrollbarViewport().getNativeElement();
        const offset = Math.abs(viewport.scrollLeft);

        if (offset === this.lastHorizontalScrollOffset) return;
        this.lastHorizontalScrollOffset = offset;
        this.horizontalContentScrolled.set(
            viewport.scrollWidth > viewport.clientWidth && offset > 0
        );
        this.elementRef.nativeElement.style.setProperty('--kbq-code-block-scroll-offset', `${offset}px`);
    }

    /** @docs-private */
    protected onLineClick(event: MouseEvent): void {
        if (!this.activeFile()?.id) return;
        const target = event.target as HTMLElement | null;
        const row = target?.closest<HTMLElement>('.kbq-code-block__line[data-line]');

        if (!row) return;
        const button = this.lineButton(event);
        const line = Number(row.getAttribute('data-line'));

        if (button?.classList.contains('kbq-code-block__line-action')) {
            button.classList.toggle('kbq-code-block__line-action_instant', event.detail === 0);
            this.focusMonitor.focusVia(
                this.lineNavigationActive() ? button : this.scrollbarViewport().getNativeElement(),
                event.detail === 0 ? 'keyboard' : 'mouse',
                { preventScroll: true }
            );
            this.activeLine.set(line);
            const selected = this.selectedRange();

            if (!selected || line < selected.start || line > selected.end) {
                this.selectLine(line, false);
                this.syncLineControls();
            }

            const range = this.lineActionRange(line);
            const url = new URL(this.window.location.href);
            const id = this.activeFile()?.id;

            url.hash = encodeURIComponent(`${id}-L${range.start}${range.end === range.start ? '' : `-L${range.end}`}`);
            this.showLineCopyTooltip(button, true);
            this.copyText(url.href, button);

            return;
        }

        const textSelection = this.window.getSelection();

        if (
            !button &&
            !event.shiftKey &&
            textSelection &&
            !textSelection.isCollapsed &&
            row.contains(textSelection.focusNode)
        ) {
            return;
        }
        if (event.shiftKey) textSelection?.removeAllRanges();
        this.selectLine(line, event.shiftKey);
        this.activeLine.set(line);
        this.syncLineControls();
        this.focusLine(line, false, event.detail === 0 ? 'keyboard' : 'mouse');
    }

    /** @docs-private */
    protected onLineHover(event: PointerEvent): void {
        const target = event.target as HTMLElement | null;
        const row = target?.closest<HTMLElement>('.kbq-code-block__line[data-line]');
        const selected = this.selectedRange();
        const line = Number(row?.getAttribute('data-line'));

        if (selected && line >= selected.start && line <= selected.end && line !== this.activeLine()) {
            this.activeLine.set(line);
            this.syncLineControls();
        }

        const button = this.lineButton(event);

        if (
            button &&
            !this.selectedRange() &&
            !this.codeElementRef()?.nativeElement.contains(this.document.activeElement)
        ) {
            this.activeLine.set(Number(button.getAttribute('data-line')));
        }
        if (button?.classList.contains('kbq-code-block__line-action') && !button.hidden) {
            this.showLineCopyTooltip(button);
        }
    }

    /** @docs-private */
    protected onLineFocus(event: FocusEvent): void {
        const button = this.lineButton(event);

        if (button) this.activeLine.set(Number(button.getAttribute('data-line')));
        if (
            button?.classList.contains('kbq-code-block__line-action') &&
            this.codeElementRef()?.nativeElement.classList.contains('cdk-keyboard-focused')
        ) {
            this.showLineCopyTooltip(button, true);
        }
    }

    /** @docs-private */
    protected onLineTooltipLeave(event: PointerEvent | FocusEvent): void {
        const copied = this.copiedLineButton;
        const copiedRow = copied?.closest('.kbq-code-block__line');

        if (
            event.type === 'pointerout' &&
            copied &&
            copiedRow?.contains(event.target as Node) &&
            !copiedRow.contains(event.relatedTarget as Node | null)
        ) {
            clearTimeout(this.copyTooltipTimer);
            copied.classList.remove('kbq-code-block__line-action_copied');
            this.copiedLineButton = undefined;
            const tooltip = this.lineCopyTooltip();

            if (tooltip && this.lineTooltipButton === copied) tooltip.content = this.lineLocale().copyLinkText;
        }

        if (
            event.type === 'focusout' &&
            !this.scrollbarViewport().getNativeElement().contains(event.relatedTarget as Node | null)
        ) {
            this.lineNavigationActive.set(false);
        }

        const button = this.lineButton(event);

        if (!button || button !== this.lineTooltipButton || button.contains(event.relatedTarget as Node | null)) return;
        clearTimeout(this.lineTooltipHideTimer);
        this.lineTooltipHideTimer = setTimeout(() => {
            clearTimeout(this.lineTooltipShowTimer);
            this.lineTooltipShowTimer = undefined;
            this.lineCopyTooltip()?.hideAsInactive();
            this.lineTooltipButton = undefined;
            this.lineTooltipHideTimer = undefined;
        }, 150);
    }

    /** @docs-private */
    protected prepareCodeTooltip(tooltip: KbqTooltipTrigger, immediate: boolean): void {
        const instant = immediate || tooltip.isOpen;

        tooltip.customClass = instant
            ? 'kbq-code-block-tooltip kbq-code-block-tooltip_instant'
            : 'kbq-code-block-tooltip';
    }

    private showLineCopyTooltip(button: HTMLButtonElement, immediate = false): void {
        const tooltip = this.lineCopyTooltip();

        if (!tooltip) return;
        clearTimeout(this.lineTooltipHideTimer);
        this.lineTooltipHideTimer = undefined;
        this.lineTooltipButton = button;
        tooltip.content = this.copiedLineButton === button
            ? this.localeConfiguration().copiedTooltip.replace(/^✓\s*/, '')
            : this.lineLocale().copyLinkText;
        this.prepareCodeTooltip(tooltip, immediate);
        if (immediate || tooltip.isOpen) {
            clearTimeout(this.lineTooltipShowTimer);
            this.lineTooltipShowTimer = undefined;
            tooltip.setExternalNativeElement(button);
            tooltip.showForElement(button);
        } else if (!this.lineTooltipShowTimer) {
            this.lineTooltipShowTimer = setTimeout(() => {
                this.lineTooltipShowTimer = undefined;
                const anchor = this.lineTooltipButton;

                if (!anchor) return;
                tooltip.setExternalNativeElement(anchor);
                tooltip.showForElement(anchor);
            }, 400);
        }
    }

    private selectLine(line: number, extend: boolean): void {
        if (!extend || !this.selectedRange()) this.selectionAnchor.set(extend ? this.activeLine() : line);
        const anchor = this.selectionAnchor();

        this.selectedRange.set({ start: Math.min(anchor, line), end: Math.max(anchor, line) });
    }

    /** @docs-private */
    protected clearLineSelection(): void {
        this.selectedRange.set(undefined);
        this.focusLine(Math.min(this.activeLine(), this.availableLineCount()));
    }

    /** @docs-private */
    protected onLineKeydown(event: KeyboardEvent): void {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const viewport = this.scrollbarViewport().getNativeElement();

        if (event.target === viewport) {
            if (event.key === 'Enter' && this.activeFile()?.id) {
                event.preventDefault();
                const bounds = viewport.getBoundingClientRect();
                const lines = this.codeLines();
                const visible = (line: HTMLElement): boolean => {
                    const target = line.getBoundingClientRect();

                    return !line.hidden && target.bottom > bounds.top && target.top < bounds.bottom;
                };
                const active = lines[this.activeLine() - 1];
                const next = active && visible(active)
                    ? this.activeLine()
                    : Math.max(1, lines.findIndex(visible) + 1);

                this.lineNavigationActive.set(true);
                this.activeLine.set(next);
                this.syncLineControls();
                this.focusLine(next);
            }

            return;
        }

        const button = this.lineButton(event);

        if (!button || !this.lineNavigationActive()) return;
        if (event.key === 'Tab') {
            this.lineNavigationActive.set(false);

            return;
        }
        const current = Number(button.getAttribute('data-line'));
        let next: number;

        switch (event.key) {
            case 'ArrowUp':
                next = current - 1;
                break;
            case 'ArrowDown':
                next = current + 1;
                break;
            case 'Home':
                next = 1;
                break;
            case 'End':
                next = this.availableLineCount();
                break;
            case 'PageUp':
                next = current - 7;
                break;
            case 'PageDown':
                next = current + 7;
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                event.preventDefault();
                this.scrollbarViewport()
                    .getNativeElement()
                    .scrollBy({ left: event.key === 'ArrowLeft' ? -40 : 40 });

                return;
            case 'Escape':
                event.preventDefault();
                this.lineNavigationActive.set(false);
                this.syncLineControls();
                clearTimeout(this.lineTooltipHideTimer);
                clearTimeout(this.lineTooltipShowTimer);
                this.lineTooltipShowTimer = undefined;
                this.lineCopyTooltip()?.hideAsInactive();
                this.lineTooltipButton = undefined;
                this.focusMonitor.focusVia(viewport, 'keyboard', { preventScroll: true });

                return;
            default:
                return;
        }

        event.preventDefault();
        next = Math.max(1, Math.min(next, this.availableLineCount()));
        if (event.shiftKey) this.selectLine(next, true);
        else this.selectedRange.set(undefined);
        this.activeLine.set(next);
        this.syncLineControls();
        this.focusLine(next);
    }

    private focusLine(number: number, revealBlock = false, origin: FocusOrigin = 'keyboard'): void {
        const line = this.codeLines()[number - 1];
        const button = line?.querySelector<HTMLButtonElement>('.kbq-code-block__line-action');

        if (!line || !button) return;
        if (revealBlock || this.hasCollapseControl()) button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const viewport = this.scrollbarViewport().getNativeElement();

        this.focusMonitor.focusVia(this.lineNavigationActive() ? button : viewport, origin, { preventScroll: true });
        const bounds = viewport.getBoundingClientRect();
        const target = line.getBoundingClientRect();

        if (target.top < bounds.top) viewport.scrollTop += target.top - bounds.top;
        else if (target.bottom > bounds.bottom) viewport.scrollTop += target.bottom - bounds.bottom;
    }

    private restoreLineFragment(): void {
        let fragment: string;

        try {
            fragment = decodeURIComponent(this.window.location.hash.slice(1));
        } catch {
            return;
        }

        const target = this.files()
            .map((file, index) => ({
                file,
                index,
                match:
                    file.id && fragment.startsWith(`${file.id}-L`)
                        ? /^([1-9]\d*)(?:-L([1-9]\d*))?$/.exec(fragment.slice(file.id.length + 2))
                        : null
            }))
            .filter(({ match }) => !!match)
            .sort((a, b) => (b.file.id?.length ?? 0) - (a.file.id?.length ?? 0))[0];

        if (!target?.match) {
            this.lastFragment = undefined;

            return;
        }

        const {
            file,
            index,
            match: [, first, last]
        } = target;
        const start = Number(first);
        const end = Number(last ?? first);
        const count = file.content ? file.content.replace(/(?:\r\n|\r|\n)$/, '').split(/\r\n|\r|\n/).length : 0;

        if (!file || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || end > count) {
            this.lastFragment = undefined;

            return;
        }

        if (fragment === this.lastFragment && file === this.lastFragmentFile) return;
        this.lastFragment = fragment;
        this.lastFragmentFile = file;

        if (this.activeFileIndex() !== index) {
            this.activeFileIndex.set(index);
            this.activeFileIndexChange.emit(index);
        }

        // Reset the linked signals after their file source changes.
        this.selectedRange.set({ start, end });
        this.selectionAnchor.set(start);
        this.activeLine.set(start);

        if (!this.viewAll()) {
            this.viewAll.set(true);
            this.viewAllChange.emit(true);
        }

        this.pendingLineFocus = start;
    }

    private copyText(text: string, trigger = this.document.activeElement as HTMLElement | undefined): void {
        this.copyTrigger = trigger;

        const copied = (): void => {
            if (trigger?.classList.contains('kbq-code-block__line-action')) {
                if (
                    !trigger.closest('.kbq-code-block__line')?.matches(':hover') &&
                    this.document.activeElement !== trigger
                ) return;

                this.copiedLineButton?.classList.remove('kbq-code-block__line-action_copied');
                this.copiedLineButton = trigger;
                trigger.classList.add('kbq-code-block__line-action_copied');
                clearTimeout(this.copyTooltipTimer);
                const tooltip = this.lineCopyTooltip();

                if (tooltip && this.lineTooltipButton === trigger) {
                    tooltip.content = this.localeConfiguration().copiedTooltip.replace(/^✓\s*/, '');
                    tooltip.show(0);
                }
                this.copyTooltipTimer = setTimeout(() => {
                    trigger.classList.remove('kbq-code-block__line-action_copied');
                    this.copiedLineButton = undefined;
                    if (tooltip && this.lineTooltipButton === trigger) {
                        tooltip.content = this.lineLocale().copyLinkText;
                    }
                }, 2000);
            } else {
                const tooltip = this.copyButtonTooltip();

                if (tooltip) tooltip.content = this.localeConfiguration().copiedTooltip;
            }
        };
        const manual = (): void => {
            if (this.destroyRef.destroyed) return;
            this.manualCopyText.set(text);
            afterNextRender(
                () => {
                    this.manualCopyDialog()?.nativeElement.showModal();
                    this.manualCopyField()?.nativeElement.select();
                },
                { injector: this.injector }
            );
        };

        const clipboard = this.window.navigator?.clipboard;

        if (clipboard?.writeText) {
            void clipboard.writeText(text).then(() => {
                if (!this.destroyRef.destroyed) copied();
            }, manual);
        } else if (this.clipboard.copy(text)) copied();
        else manual();
    }

    /** @docs-private */
    protected closeManualCopy(): void {
        this.manualCopyText.set(undefined);
        if (this.copyTrigger?.isConnected) this.focusMonitor.focusVia(this.copyTrigger, 'keyboard');
    }

    /**
     * Copies the file code to the clipboard.
     *
     * If the copy was successful, the copy button tooltip content is updated
     * to show the "copied" message.
     *
     * @docs-private
     */
    protected copyCode(event?: MouseEvent): void {
        const file = this.activeFile();

        if (!file) return;

        this.copyText(file.content, event?.currentTarget as HTMLElement | undefined);
    }

    /**
     * Opens the file link in a new window.
     *
     * @docs-private
     */
    protected openLink(): void {
        const file = this.activeFile();

        if (!file?.link) return;

        const safeURL = this.domSanitizer.sanitize(SecurityContext.URL, file.link);

        if (safeURL) {
            this.window.open(safeURL.toString(), '_blank');
        }
    }

    /**
     * Downloads the file as a blob.
     *
     * Creates a link with a blob as href and the file name as download attribute.
     * Then simulates a click event on the link to initiate the download.
     *
     * @docs-private
     */
    protected downloadCode(): void {
        const file = this.activeFile();

        if (!file) return;

        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = this.document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', file.filename || this.fallbackFileName);
        link.click();
    }
}
