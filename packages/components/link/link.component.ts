import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef, ContentChild, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import {
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean,
} from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';

/** @docs-private */
export class KbqLinkBase {}

/** @docs-private */
export const KbqLinkMixinBase: HasTabIndexCtor & CanDisableCtor & typeof KbqLinkBase = mixinTabIndex(
    mixinDisabled(KbqLinkBase),
);

export const baseURLRegex = /^http(s)?:\/\//;

@Directive({
    selector: '[kbq-link]',
    exportAs: 'kbqLink',
    inputs: ['tabIndex'],
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
        '[class.kbq-disabled]': 'disabled || null',
        '[attr.disabled]': 'disabled || null',
        '[attr.tabindex]': 'tabIndex',
        '[attr.print]': 'printUrl',
    },
})
export class KbqLink extends KbqLinkMixinBase implements OnDestroy, HasTabIndex, CanDisable {
    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    @Input()
    get pseudo() {
        return this._pseudo;
    }

    set pseudo(value: any) {
        this._pseudo = toBoolean(value);
    }

    private _pseudo = false;

    @Input()
    get noUnderline() {
        return this._noUnderline;
    }

    set noUnderline(value: any) {
        this._noUnderline = toBoolean(value);
    }

    private _noUnderline = false;

    @Input()
    get big() {
        return this._big;
    }

    set big(value: any) {
        this._big = toBoolean(value);
    }

    private _big = false;

    @Input()
    get compact() {
        return this._compact;
    }

    set compact(value: any) {
        this._compact = toBoolean(value);
    }

    private _compact = false;

    @Input()
    get useVisited() {
        return this._useVisited;
    }

    set useVisited(value: any) {
        this._useVisited = toBoolean(value);
    }

    private _useVisited = false;

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
        private changeDetector: ChangeDetectorRef,
    ) {
        super();

        this.focusMonitor.monitor(elementRef.nativeElement, true);

        this.updatePrintUrl();
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
