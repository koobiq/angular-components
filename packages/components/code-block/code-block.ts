import { A11yModule, FocusMonitor } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { Platform } from '@angular/cdk/platform';
import { CdkScrollable, CdkScrollableModule } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    numberAttribute,
    Output,
    Provider,
    Renderer2,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KbqCodeBlockLocaleConfiguration,
    KbqComponentColors,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, fromEvent, merge } from 'rxjs';
import { KbqCodeBlockHighlight } from './code-block-highlight';
import { KbqCodeBlockFile } from './types';

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

/**
 * Component which highlights blocks of code.
 */
@Component({
    standalone: true,
    imports: [
        KbqTabsModule,
        KbqButtonModule,
        KbqCodeBlockHighlight,
        A11yModule,
        CdkScrollableModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    selector: 'kbq-code-block',
    exportAs: 'kbqCodeBlock',
    templateUrl: './code-block.html',
    styleUrls: ['./code-block.scss', './code-block-tokens.scss'],
    host: {
        class: 'kbq-code-block',
        '[class.kbq-code-block_filled]': 'filled',
        '[class.kbq-code-block_outline]': '!filled',
        '[class.kbq-code-block_hide-line-numbers]': '!lineNumbers',
        '[class.kbq-code-block_hide-tabs]': 'hideTabs',
        '[class.kbq-code-block_no-border]': 'noBorder || filled',
        '[class.kbq-code-block_soft-wrap]': 'softWrap',
        '[class.kbq-code-block_view-all]': 'viewAll'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqCodeBlock implements AfterViewInit {
    @ViewChild('copyButtonTooltip') private readonly copyButtonTooltip?: KbqTooltipTrigger;
    @ViewChild(CdkScrollable) readonly scrollableCodeContent: CdkScrollable;

    /** Whether to display line numbers. */
    @Input({ transform: booleanAttribute }) lineNumbers = false;

    /** Whether the code block should be filled. */
    @Input({ transform: booleanAttribute }) filled: boolean = false;

    /** Added soft wrap toggle button.  */
    @Input({ transform: booleanAttribute }) canToggleSoftWrap: boolean = false;

    /** Whether sequences of whitespace should be preserved. */
    @Input({ transform: booleanAttribute }) softWrap: boolean = false;

    /** Event emitted when `softWrap` is changed. */
    @Output() readonly softWrapChange = new EventEmitter<boolean>();

    /**
     * Allows to view all the code, otherwise it will be hidden.
     * Works only with `maxHeight` property.
     */
    @Input({ transform: booleanAttribute }) viewAll: boolean = false;

    /** Event emitted when `viewAll` is changed. */
    @Output() readonly viewAllChange = new EventEmitter<boolean>();

    /**
     * Maximum height of the code block content, other parts will be hidden.
     * Can be toggled by `viewAll` property.
     */
    @Input({ transform: numberAttribute }) maxHeight: number;

    protected get calculatedMaxHeight(): number | null {
        return this.maxHeight > 0 && !this.viewAll ? this.maxHeight : null;
    }

    /** @deprecated Will be removed in next major release, use `canDownload` instead. */
    @Input({ transform: booleanAttribute })
    set canLoad(value: boolean) {
        this.canDownload = value;
    }

    /** Added download code button. */
    @Input({ transform: booleanAttribute }) canDownload: boolean = false;

    /** Added copy code button. */
    @Input({ transform: booleanAttribute }) canCopy: boolean = true;

    /** @deprecated Will be removed in next major release, use `files` instead. */
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
    set files(files: KbqCodeBlockFile[]) {
        this._files = files;

        if (this._files.length < this.activeFileIndex) {
            this.onSelectedTabChange(0);
        }

        if (this._files.length === 1 && !this._files[0].filename) {
            this.hideTabs = true;
        }
    }

    get files(): KbqCodeBlockFile[] {
        return this._files;
    }

    private _files: KbqCodeBlockFile[] = [];

    /** Defines which file (index) is active. */
    @Input({ transform: numberAttribute }) activeFileIndex = 0;

    @Output() readonly activeFileIndexChange = new EventEmitter<number>();

    /** Whether to hide border. */
    @Input({ transform: booleanAttribute }) noBorder: boolean = false;

    /**
     * Whether to hide header tabs.
     * Always `true` if there is only one file without filename.
     * Makes actionbar floating if tabs are hidden.
     */
    @Input({ transform: booleanAttribute })
    set hideTabs(value: boolean) {
        this._hideTabs = value;

        this.setupActionbarDisplay();
    }

    get hideTabs(): boolean {
        return this._hideTabs;
    }

    private _hideTabs: boolean = false;

    /** Component locale configuration. */
    protected get localeConfiguration(): KbqCodeBlockLocaleConfiguration {
        return this._localeConfiguration;
    }

    private _localeConfiguration: KbqCodeBlockLocaleConfiguration = inject(KBQ_CODE_BLOCK_LOCALE_CONFIGURATION);

    /** Code content tab index. */
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
        const element = this.scrollableCodeContent?.getElementRef().nativeElement;

        return element && this.hasScroll(element) && !this.calculatedMaxHeight;
    }

    protected readonly componentColor = KbqComponentColors;
    protected readonly buttonStyle = KbqButtonStyles;

    private readonly elementRef = inject(ElementRef);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
    private readonly platform = inject(Platform);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly clipboard = inject(Clipboard);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly document = inject<Document>(DOCUMENT);
    protected readonly fallbackFileName = inject(KBQ_CODE_BLOCK_FALLBACK_FILE_NAME);

    constructor() {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);
    }

    ngAfterViewInit(): void {
        this.handleScroll();
        this.handleHover();

        // Setup initial actionbar display state
        this.setupActionbarDisplay();

        this.copyButtonTooltip?.visibleChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((isVisible) => {
            if (isVisible) {
                this.copyButtonTooltip!.content = this.localeConfiguration.copyTooltip;
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
        this.viewAll = !this.viewAll;

        if (!this.viewAll) {
            this.scrollableCodeContent.scrollTo({ top: 0, behavior: 'instant' });
        }

        this.viewAllChange.emit(this.viewAll);
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
     */
    protected onSelectedTabChange(index: number): void {
        if (this.activeFileIndex !== index) {
            this.activeFileIndex = index;
            this.activeFileIndexChange.emit(this.activeFileIndex);
            this.scrollableCodeContent.scrollTo({ top: 0, behavior: 'instant' });
        }
    }

    /**
     * Handles the hover event on the code block element and updates the actionbar display accordingly.
     */
    private handleHover(): void {
        merge(
            fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter'),
            fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave')
        )
            .pipe(debounceTime(100), takeUntilDestroyed(this.destroyRef))
            .subscribe((event) => {
                this.setupActionbarDisplay(event?.type === 'mouseenter');
            });
    }

    /**
     * Handles the scroll event on the scrollable code content element and updates the header shadow accordingly.
     */
    private handleScroll(): void {
        this.scrollableCodeContent
            .elementScrolled()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.setupHeaderShadow(this.scrollableCodeContent.measureScrollOffset('top') > 0);
            });
    }

    /**
     * Adds or removes the shadow class from the code block based on the specified condition.
     *
     * @param shouldShowShadow - A boolean indicating whether to add or remove the shadow class.
     */
    private setupHeaderShadow(shouldShowShadow: boolean): void {
        const className = 'kbq-code-block_header-with-shadow';

        if (shouldShowShadow) {
            this.renderer.addClass(this.elementRef.nativeElement, className);
        } else {
            this.renderer.removeClass(this.elementRef.nativeElement, className);
        }
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

    /** Handles the enter keydown event on `viewAll` button. */
    protected onViewAllEnterKeydown(): void {
        this.toggleViewAll();

        if (this.canCodeContentBeFocused) {
            this.focusMonitor.focusVia(this.scrollableCodeContent.getElementRef().nativeElement, 'keyboard');
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
     */
    protected copyCode(): void {
        const file = this.files[this.activeFileIndex];

        if (this.clipboard.copy(file.content) && this.copyButtonTooltip) {
            this.copyButtonTooltip.content = this.localeConfiguration.copiedTooltip;
        }
    }

    /**
     * Opens the file link in a new window.
     */
    protected openLink(): void {
        const window = this.getWindow();
        const file = this.files[this.activeFileIndex];
        const safeURL = this.domSanitizer.sanitize(SecurityContext.URL, file.link!);

        if (safeURL) {
            window?.open(safeURL.toString(), '_blank');
        }
    }

    /**
     * Downloads the file as a blob.
     *
     * Creates a link with a blob as href and the file name as download attribute.
     * Then simulates a click event on the link to initiate the download.
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

    /** Use defaultView of injected document if available or fallback to global window reference */
    private getWindow(): Window | null {
        return this.document?.defaultView || window;
    }
}
