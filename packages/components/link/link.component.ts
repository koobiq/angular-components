import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    contentChild,
    ContentChildren,
    DestroyRef,
    Directive,
    ElementRef,
    forwardRef,
    inject,
    Input,
    input,
    numberAttribute,
    OnDestroy,
    QueryList,
    Renderer2,
    signal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
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
    host: {
        class: 'kbq-link',
        '[class.kbq-link_no-underline]': 'noUnderline()',
        '[class.kbq-link_use-visited]': 'useVisited()',
        '[class.kbq-link_big]': 'big()',
        '[class.kbq-link_compact]': 'compact()',
        '[class.kbq-link_pseudo]': 'pseudo()',
        '[class.kbq-link_multiline]': 'multiline()',
        '[class.kbq-link_print]': 'printMode',
        '[class.kbq-text-only]': '!hasIcon',
        '[class.kbq-text-with-icon]': 'hasIcon',
        '[class.kbq-disabled]': 'disabled',
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '[attr.print]': 'printUrl'
    },
    exportAs: 'kbqLink'
})
export class KbqLink implements AfterContentInit, AfterViewInit, OnDestroy {
    private elementRef = inject<ElementRef<HTMLAnchorElement>>(ElementRef);
    private focusMonitor = inject(FocusMonitor);

    protected readonly renderer = inject(Renderer2);
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly nativeElement = kbqInjectNativeElement();

    @ContentChildren(forwardRef(() => KbqIcon), { read: ElementRef }) icons: QueryList<ElementRef>;

    // @todo 20 In the next major release this feature will be replaced on the input signal.
    /** Whether the link is disabled. */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this.disabledSignal.set(value);
    }

    /** @docs-private */
    readonly disabledSignal = signal(false);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    readonly pseudo = input<boolean, unknown>(false, { transform: booleanAttribute });

    readonly noUnderline = input<boolean, unknown>(false, { transform: booleanAttribute });

    readonly big = input<boolean, unknown>(false, { transform: booleanAttribute });

    readonly compact = input<boolean, unknown>(false, { transform: booleanAttribute });

    /** Whether the link has an increased hit area for multiline usage. */
    readonly multiline = input<boolean, unknown>(false, { transform: booleanAttribute });

    readonly useVisited = input<boolean, unknown>(false, { transform: booleanAttribute });

    get hasIcon(): boolean {
        return !!this.icon();
    }

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    set print(value: any) {
        this.printMode = value !== null;

        this._print = value;

        this.updatePrintUrl();
    }

    private _print: string;

    printMode: boolean;

    printUrl: string;

    // @todo 20 In the next major release this line will be deleted.
    private _disabled: boolean;

    readonly icon = contentChild(KbqIcon);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {
        this.updatePrintUrl();

        // @todo 20 In the next major release this line will be deleted.
        toObservable(this.disabledSignal).subscribe((value) => (this._disabled = value));
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
