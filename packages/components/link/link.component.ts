import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    ContentChild,
    ContentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Input,
    numberAttribute,
    OnDestroy,
    QueryList,
    Renderer2
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    getNodesWithoutComments,
    kbqInjectNativeElement,
    leftIconClassName,
    rightIconClassName
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

export const baseURLRegex = /^http(s)?:\/\//;

@Directive({
    selector: '[kbq-link]',
    exportAs: 'kbqLink',
    host: {
        class: 'kbq-link',
        '[class.kbq-link_no-underline]': 'noUnderline',
        '[class.kbq-link_use-visited]': 'useVisited',
        '[class.kbq-link_big]': 'big',
        '[class.kbq-link_compact]': 'compact',
        '[class.kbq-link_pseudo]': 'pseudo',
        '[class.kbq-link_print]': 'printMode',
        '[class.kbq-text-only]': '!hasIcon',
        '[class.kbq-text-with-icon]': 'hasIcon',
        '[class.kbq-disabled]': 'disabled',
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '[attr.print]': 'printUrl'
    }
})
export class KbqLink implements AfterContentInit, AfterViewInit, OnDestroy {
    protected readonly renderer = inject(Renderer2);
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly nativeElement = kbqInjectNativeElement();

    @ContentChildren(forwardRef(() => KbqIcon), { read: ElementRef }) icons: QueryList<ElementRef>;

    /** Whether the link is disabled. */
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    @Input({ transform: booleanAttribute }) pseudo: boolean = false;

    @Input({ transform: booleanAttribute }) noUnderline: boolean = false;

    @Input({ transform: booleanAttribute }) big: boolean = false;

    @Input({ transform: booleanAttribute }) compact: boolean = false;

    @Input({ transform: booleanAttribute }) useVisited: boolean = false;

    get hasIcon(): boolean {
        return !!this.icon;
    }

    @Input()
    set print(value: any) {
        this.printMode = value !== null;

        this._print = value;

        this.updatePrintUrl();
    }

    private _print: string;

    printMode: boolean;

    printUrl: string;

    @ContentChild(KbqIcon) icon: KbqIcon;

    constructor(
        private elementRef: ElementRef<HTMLAnchorElement>,
        private focusMonitor: FocusMonitor,
        private changeDetector: ChangeDetectorRef
    ) {
        this.updatePrintUrl();
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this.getHostElement().focus();
    }

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    ngAfterContentInit() {
        this.updateClassModifierForIcons();

        this.icons.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.updateClassModifierForIcons);
    }

    private updateClassModifierForIcons = () => {
        this.icons.forEach(({ nativeElement }) => {
            this.renderer.removeClass(nativeElement, leftIconClassName);
            this.renderer.removeClass(nativeElement, rightIconClassName);
        });

        const filteredNodesWithoutComments = getNodesWithoutComments(this.nativeElement.childNodes as NodeList);

        if (this.icons.length && filteredNodesWithoutComments.length > 1) {
            this.icons.forEach(({ nativeElement }) => {
                const iconIndex = filteredNodesWithoutComments.findIndex((node) => node === nativeElement);

                if (iconIndex === 0) {
                    this.renderer.addClass(nativeElement, leftIconClassName);
                }

                if (iconIndex === filteredNodesWithoutComments.length - 1) {
                    this.renderer.addClass(nativeElement, rightIconClassName);
                }
            });
        }
    };

    private updatePrintUrl() {
        Promise.resolve().then(() => {
            this.printUrl = this._print || this.getHostElement().href?.replace(baseURLRegex, '');
        });
    }
}
