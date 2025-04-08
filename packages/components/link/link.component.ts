import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    ContentChild,
    Directive,
    ElementRef,
    Input,
    numberAttribute,
    OnDestroy
} from '@angular/core';
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
export class KbqLink implements AfterViewInit, OnDestroy {
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
        private elementRef: ElementRef,
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

    private updatePrintUrl() {
        Promise.resolve().then(() => {
            this.printUrl = this._print || this.getHostElement().href?.replace(baseURLRegex, '');
        });
    }
}
