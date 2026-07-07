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
    ContentChild,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    Injector,
    Input,
    input,
    numberAttribute,
    output,
    Provider,
    Renderer2,
    SecurityContext,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { outputToObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KBQ_WINDOW,
    KbqCodeBlockLocaleConfiguration,
    KbqComponentColors,
    KbqOverflowShadowContainer,
    KbqOverflowShadowTop,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, EMPTY, filter, fromEvent, merge, startWith, switchMap, take } from 'rxjs';
import { KbqCodeBlockHighlight } from './code-block-highlight';
import { KbqCodeBlockFile, KbqTabLinkTemplateContext } from './types';

/** Localization configuration provider. */
export const KBQ_CODE_BLOCK_LOCALE_CONFIGURATION = new InjectionToken<KbqCodeBlockLocaleConfiguration>(
    'KBQ_CODE_BLOCK_LOCALE_CONFIGURATION',
    { factory: () => ruRULocaleData.codeBlock }
);

/** Utility provider for `KBQ_CODE_BLOCK_LOCALE_CONFIGURATION`. */
export const kbqCodeBlockLocaleConfigurationProvider = (configuration: KbqCodeBlockLocaleConfiguration): Provider => ({
    provide: KBQ_CODE_BLOCK_LOCALE_CONFIGURATION,
    useValue: configuration
});

/** Fallback file name for code block if file name is not specified. */
export const KBQ_CODE_BLOCK_FALLBACK_FILE_NAME = new InjectionToken<string>('KBQ_CODE_BLOCK_FALLBACK_FILE_NAME', {
    factory: () => 'code'
});

/** Utility provider for `KBQ_CODE_BLOCK_FALLBACK_FILE_NAME`. */
export const kbqCodeBlockFallbackFileNameProvider = (fileName: string): Provider => ({
    provide: KBQ_CODE_BLOCK_FALLBACK_FILE_NAME,
    useValue: fileName
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
        '[class.kbq-code-block_soft-wrap]': 'softWrap',
        '[class.kbq-code-block_view-all]': 'viewAll'
    },
    exportAs: 'kbqCodeBlock'
})
export class KbqCodeBlock implements AfterViewInit {
    private readonly copyButtonTooltip = viewChild<KbqTooltipTrigger>('copyButtonTooltip');
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

    /** Whether sequences of whitespace should be preserved. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) softWrap: boolean = false;

    /**
     * Output to support two-way binding on `[(softWrap)]` property.
     */
    readonly softWrapChange = output<boolean>();

    /**
     * Allows to view all the code, otherwise it will be hidden.
     * Works only with `maxHeight` property.
     */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) viewAll: boolean = false;

    /**
     * Output to support two-way binding on `[(viewAll)]` property.
     */
    readonly viewAllChange = output<boolean>();

    /**
     * Maximum height of the code block content, other parts will be hidden.
     * Can be toggled by `viewAll` property.
     */
    readonly maxHeight = input<number, unknown>(undefined!, { transform: numberAttribute });

    /**
     * @docs-private
     */
    protected get calculatedMaxHeight(): number | null {
        return this.maxHeight() > 0 && !this.viewAll ? this.maxHeight() : null;
    }

    /**
     * @deprecated Will be removed in next major release, use `canDownload` instead.
     *
     * @docs-private
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    set canLoad(value: boolean) {
        this.canDownload = value;
    }

    /** Added download code button. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) canDownload: boolean = false;

    /** Added copy code button. */
    readonly canCopy = input<boolean, unknown>(true, { transform: booleanAttribute });

    /**
     * @deprecated Will be removed in next major release, use `files` instead.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    set codeFiles(files: KbqCodeBlockFile[]) {
        this.files = files;
    }

    /**
     * @TODO Mark as `required`, after removing `codeFiles`
     *
     * Files to display.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get files(): KbqCodeBlockFile[] {
        return this._files;
    }

    set files(files: KbqCodeBlockFile[]) {
        this._files = files;

        if (this._files.length < this.activeFileIndex) {
            this.onSelectedTabChange(0);
        }

        if (this._files.length === 1 && !this._files[0].filename) {
            this.hideTabs = true;
        }
    }

    private _files: KbqCodeBlockFile[] = [];

    /** Defines which file (index) is active. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: numberAttribute }) activeFileIndex = 0;

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
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get hideTabs(): boolean {
        return this._hideTabs;
    }

    set hideTabs(value: boolean) {
        this._hideTabs = value;
        this.hideTabsChange.emit(value);
        this.setupActionbarDisplay();
    }

    private _hideTabs: boolean = false;

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
        return this._localeConfiguration;
    }

    private _localeConfiguration: KbqCodeBlockLocaleConfiguration = inject(KBQ_CODE_BLOCK_LOCALE_CONFIGURATION);

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

        return element && this.hasScroll(element) && !this.calculatedMaxHeight;
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
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
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

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);
    }

    ngAfterViewInit(): void {
        this.trackHoverState();
        this.setupContentOverflowDetection();

        // Setup initial actionbar display state
        this.setupActionbarDisplay();

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

    /**
     * Tracks hover events to show/hide the actionbar when `hideTabs` is `true`.
     * Reacts to `hideTabs` changes dynamically.
     */
    private trackHoverState(): void {
        outputToObservable(this.hideTabsChange)
            .pipe(
                startWith(this._hideTabs),
                switchMap((hideTabs) => {
                    if (!hideTabs) return EMPTY;

                    return merge(
                        fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter'),
                        fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave')
                    ).pipe(debounceTime(100));
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((event) => {
                this.setupActionbarDisplay(event?.type === 'mouseenter');
            });
    }

    private setupContentOverflowDetection(): void {
        if (!this.platform.isBrowser) return;

        if (!this.maxHeight()) return;

        const checkOverflow = () => {
            this.contentExceedsMaxHeight.set(this.preElementRef().nativeElement.offsetHeight > this.maxHeight());
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

    /**
     * Adds or removes the actionbar display class from the code block based on the specified condition.
     *
     * The actionbar is always visible on mobile devices and when the tabs are visible.
     * Otherwise, the actionbar is only visible when the mouse is hovered over the code block.
     *
     * @param shouldShowActionbar - A boolean indicating whether the actionbar should be visible.
     */
    private setupActionbarDisplay(shouldShowActionbar?: boolean): void {
        const className = 'kbq-code-block_show-actionbar';

        // Should always show actionbar on Mobile devices
        if (this.platform.IOS || this.platform.ANDROID) {
            this.renderer.addClass(this.elementRef.nativeElement, className);

            return;
        }

        // Should always show actionbar when tabs are visible
        if (!this.hideTabs) {
            this.renderer.addClass(this.elementRef.nativeElement, className);

            return;
        }

        if (typeof shouldShowActionbar === 'undefined') {
            return;
        }

        if (shouldShowActionbar) {
            this.renderer.addClass(this.elementRef.nativeElement, className);
        } else {
            this.renderer.removeClass(this.elementRef.nativeElement, className);
        }
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

    private updateLocaleParams = (): void => {
        this._localeConfiguration = this.localeService?.getParams('codeBlock');

        this.changeDetectorRef.markForCheck();
    };

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
