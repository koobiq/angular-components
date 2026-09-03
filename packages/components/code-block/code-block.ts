import { A11yModule, FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Platform } from '@angular/cdk/platform';
import { CdkScrollable, CdkScrollableModule, ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    ContentChild,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    Injector,
    Input,
    input,
    numberAttribute,
    output,
    Provider,
    SecurityContext,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    KBQ_WINDOW,
    KbqCodeBlockLocaleConfiguration,
    KbqComponentColors,
    KbqDeepPartial,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    KbqOverflowShadowContainer,
    KbqOverflowShadowTop,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, filter, fromEvent, map, merge, take } from 'rxjs';
import { KbqCodeBlockHighlight } from './code-block-highlight';
import { KbqCodeBlockFile, KbqTabLinkTemplateContext } from './types';

/** Localization configuration provider. */
export const KBQ_CODE_BLOCK_LOCALE_CONFIGURATION = new InjectionToken<KbqCodeBlockLocaleConfiguration>(
    'KBQ_CODE_BLOCK_LOCALE_CONFIGURATION',
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
    /** Whether the actionbar should remain visible when tabs are hidden. */
    alwaysShowActionbar: boolean;
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
        CdkScrollableModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqNativeScrollbar,
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
        // highlight.js rewrites the <code> subtree on the client (and builds a <table> for line numbers),
        // which never matches the server-rendered DOM — skip hydration for this component to avoid NG0500.
        ngSkipHydration: 'true',
        '[class.kbq-code-block_filled]': 'filled()',
        '[class.kbq-code-block_outline]': '!filled()',
        '[class.kbq-code-block_hide-line-numbers]': '!lineNumbers()',
        '[class.kbq-code-block_hide-tabs]': 'hideTabs',
        '[class.kbq-code-block_no-border]': 'noBorder() || filled()',
        '[class.kbq-code-block_show-actionbar]': 'actionbarVisible()',
        '[class.kbq-code-block_soft-wrap]': 'softWrap',
        '[class.kbq-code-block_view-all]': 'viewAll'
    },
    exportAs: 'kbqCodeBlock'
})
export class KbqCodeBlock implements AfterViewInit {
    private readonly copyButtonTooltip = viewChild<KbqTooltipTrigger>('copyButtonTooltip');
    private readonly defaultOptions = inject(KBQ_CODE_BLOCK_DEFAULT_OPTIONS, { optional: true });
    /**
     * Reference to the scrollable code content.
     *
     * @deprecated Use `scrollTo` method instead, will be removed from public API (mark as private) in the next major release.
     *
     * @docs-private
     */
    readonly scrollableCodeContent = viewChild.required(CdkScrollable);

    /** @docs-private */
    private readonly highlight = viewChild.required(KbqCodeBlockHighlight);

    /** @docs-private */
    private readonly preElementRef = viewChild.required<ElementRef<HTMLElement>>('codeBlockPre');

    /** @docs-private */
    protected readonly contentExceedsMaxHeight = signal(false);

    /** @docs-private */
    @ContentChild(KbqCodeBlockTabLinkContent, { read: TemplateRef })
    protected readonly tabLinkTemplate: TemplateRef<KbqTabLinkTemplateContext>;

    /** Whether to display line numbers. */
    readonly lineNumbers = input(false, { transform: booleanAttribute });

    /** Whether the code block should be filled. */
    readonly filled = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Added soft wrap toggle button.  */
    readonly canToggleSoftWrap = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Whether sequences of whitespace should be preserved.
     *
     * Two-way state: `toggleSoftWrap()` writes it as well as the binding, so it stays an accessor over a
     * signal — a `model()` cannot carry the `booleanAttribute` transform a valueless attribute needs.
     */
    @Input({ transform: booleanAttribute })
    get softWrap(): boolean {
        return this._softWrap();
    }

    set softWrap(value: boolean) {
        this._softWrap.set(value);
    }

    private readonly _softWrap = signal(false);

    /**
     * Output to support two-way binding on `[(softWrap)]` property.
     */
    readonly softWrapChange = output<boolean>();

    /**
     * Allows to view all the code, otherwise it will be hidden.
     * Works only with `maxHeight` property.
     *
     * Two-way state, like `softWrap`.
     */
    @Input({ transform: booleanAttribute })
    get viewAll(): boolean {
        return this._viewAll();
    }

    set viewAll(value: boolean) {
        this._viewAll.set(value);
    }

    private readonly _viewAll = signal(false);

    /**
     * Output to support two-way binding on `[(viewAll)]` property.
     */
    readonly viewAllChange = output<boolean>();

    /**
     * Maximum height of the code block content, other parts will be hidden.
     * Can be toggled by `viewAll` property.
     */
    readonly maxHeight = input<number | undefined, unknown>(undefined, {
        transform: (value) => (value == null ? undefined : numberAttribute(value))
    });

    /**
     * @docs-private
     */
    protected readonly calculatedMaxHeight = computed<number | null>(() => {
        const maxHeight = this.maxHeight();

        return maxHeight && maxHeight > 0 && !this._viewAll() ? maxHeight : null;
    });

    /**
     * @deprecated Will be removed in next major release, use `canDownload` instead.
     *
     * @docs-private
     */
    @Input({ transform: booleanAttribute })
    set canLoad(value: boolean) {
        this.canDownload = value;
    }

    /** Added download code button. */
    @Input({ transform: booleanAttribute })
    get canDownload(): boolean {
        return this._canDownload();
    }

    set canDownload(value: boolean) {
        this._canDownload.set(value);
    }

    private readonly _canDownload = signal(false);

    /** Added copy code button. */
    readonly canCopy = input<boolean, unknown>(true, { transform: booleanAttribute });

    /** Whether the actionbar should remain visible when tabs are hidden. */
    readonly alwaysShowActionbar = input<boolean, unknown>(this.defaultOptions?.alwaysShowActionbar ?? false, {
        transform: booleanAttribute
    });

    /**
     * @deprecated Will be removed in next major release, use `files` instead.
     */
    @Input()
    set codeFiles(files: KbqCodeBlockFile[]) {
        this.files = files;
    }

    /**
     * @TODO Mark as `required`, after removing `codeFiles`
     *
     * Files to display.
     */
    @Input()
    get files(): KbqCodeBlockFile[] {
        return this._files();
    }

    set files(files: KbqCodeBlockFile[]) {
        this._files.set(files);

        if (files.length < this.activeFileIndex) {
            this.onSelectedTabChange(0);
        }

        if (files.length === 1 && !files[0].filename) {
            this.hideTabs = true;
        }
    }

    private readonly _files = signal<KbqCodeBlockFile[]>([]);

    /** Defines which file (index) is active. */
    @Input({ transform: numberAttribute })
    get activeFileIndex(): number {
        return this._activeFileIndex();
    }

    set activeFileIndex(value: number) {
        this._activeFileIndex.set(value);
    }

    private readonly _activeFileIndex = signal(0);

    /**
     * Output to support two-way binding on `[(activeFileIndex)]` property.
     */
    readonly activeFileIndexChange = output<number>();

    /** Whether to hide border. */
    readonly noBorder = input<boolean, unknown>(false, { transform: booleanAttribute });

    /**
     * Whether to hide header tabs.
     * Always `true` if there is only one file without filename.
     * Makes actionbar floating if tabs are hidden.
     */
    @Input({ transform: booleanAttribute })
    get hideTabs(): boolean {
        return this._hideTabs();
    }

    set hideTabs(value: boolean) {
        this._hideTabs.set(value);
        this.hideTabsChange.emit(value);
    }

    private readonly _hideTabs = signal(false);
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
    protected get localeConfiguration(): KbqCodeBlockLocaleConfiguration {
        return this._localeConfiguration();
    }

    // A getter over the signal rather than `localeConfiguration()`: every read site — template and the
    // imperative tooltip updates alike — keeps its current shape, while the template read now registers
    // the locale dependency on this view and re-renders on `setLocale()` without a `markForCheck`.
    private readonly _localeConfiguration = kbqInjectLocaleConfiguration(
        'codeBlock',
        KBQ_CODE_BLOCK_LOCALE_CONFIGURATION
    );

    /**
     * Code content tab index.
     *
     * @docs-private
     */
    protected get codeContentTabIndex(): number {
        return this.canCodeContentBeFocused ? 0 : -1;
    }

    /**
     * Determines whether the code content can be focused.
     *
     * This checks if the scrollable code content element is present,
     * has a scroll, and the calculated maximum height is not set.
     */
    private get canCodeContentBeFocused(): boolean {
        if (!this.platform.isBrowser) return false;

        const element = this.scrollableCodeContent()?.getElementRef().nativeElement;

        return element && this.hasScroll(element) && !this.calculatedMaxHeight();
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
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
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
            !this._hideTabs() ||
            this.actionbarHovered()
    );

    constructor() {
        this.trackHoverState();
    }

    ngAfterViewInit(): void {
        this.setupContentOverflowDetection();

        this.copyButtonTooltip()
            ?.visibleChange.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((isVisible) => {
                if (isVisible) {
                    this.copyButtonTooltip()!.content = this.localeConfiguration.copyTooltip;
                }
            });

        // Should call `markForCheck` to ensure the `codeContentTabIndex` is updated after the view is initialized,
        // for correct focus behavior.
        this.changeDetectorRef.markForCheck();
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
        this.viewAll = !this.viewAll;

        if (!this.viewAll) {
            this.scrollTo({ top: 0, behavior: 'instant' });
        }

        this.viewAllChange.emit(this.viewAll);
    }

    /** Scrolls the code content to the specified position. */
    scrollTo(options: ExtendedScrollToOptions): void {
        const scroll = () => this.scrollableCodeContent().scrollTo(options);

        const highlight = this.highlight();

        if (highlight?.pending()) {
            toObservable(highlight.pending, { injector: this.injector })
                .pipe(
                    filter((pending) => !pending),
                    take(1)
                )
                .subscribe(scroll);
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
        this.softWrap = !this.softWrap;
        this.softWrapChange.emit(this.softWrap);
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
        if (this.activeFileIndex !== index) {
            this.activeFileIndex = index;
            this.activeFileIndexChange.emit(this.activeFileIndex);
            this.scrollTo({ top: 0, behavior: 'instant' });
        }
    }

    /** Tracks hover when tabs are hidden and `alwaysShowActionbar` is disabled. */
    private trackHoverState(): void {
        effect(
            (onCleanup) => {
                const hideTabs = this._hideTabs();
                const alwaysShowActionbar = this.alwaysShowActionbar();

                this.actionbarHovered.set(false);

                if (!hideTabs || alwaysShowActionbar || this.platform.IOS || this.platform.ANDROID) return;

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

    private setupContentOverflowDetection(): void {
        if (!this.platform.isBrowser) return;

        const maxHeight = this.maxHeight();

        if (!maxHeight) return;

        const checkOverflow = () => {
            this.contentExceedsMaxHeight.set(this.preElementRef().nativeElement.offsetHeight > maxHeight);
        };

        checkOverflow();

        const highlight = this.highlight();

        if (highlight?.pending()) {
            toObservable(highlight.pending, { injector: this.injector })
                .pipe(
                    filter((pending) => !pending),
                    take(1)
                )
                .subscribe(checkOverflow);
        }

        this.sharedResizeObserver
            .observe(this.preElementRef().nativeElement)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(checkOverflow);
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
            this.focusMonitor.focusVia(this.scrollableCodeContent().getElementRef().nativeElement, 'keyboard');
        }
    }

    /**
     * Copies the file code to the clipboard.
     *
     * If the copy was successful, the copy button tooltip content is updated
     * to show the "copied" message.
     *
     * @docs-private
     */
    protected copyCode(): void {
        const file = this.files[this.activeFileIndex];

        const copyButtonTooltip = this.copyButtonTooltip();

        if (this.clipboard.copy(file.content) && copyButtonTooltip) {
            copyButtonTooltip.content = this.localeConfiguration.copiedTooltip;
        }
    }

    /**
     * Opens the file link in a new window.
     *
     * @docs-private
     */
    protected openLink(): void {
        const file = this.files[this.activeFileIndex];
        const safeURL = this.domSanitizer.sanitize(SecurityContext.URL, file.link!);

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
        const file = this.files[this.activeFileIndex];
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = this.document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', file.filename || this.fallbackFileName);
        link.click();
    }
}
