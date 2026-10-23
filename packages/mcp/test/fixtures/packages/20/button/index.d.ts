import * as i0 from '@angular/core';
import { OnDestroy, AfterViewInit } from '@angular/core';
import { KbqColorDirective, KbqTitleTextRef } from '@koobiq/components/core';

declare enum KbqButtonStyles {
    Filled = "filled",
    Outline = "outline",
    Transparent = "transparent"
}
declare class KbqButton extends KbqColorDirective implements OnDestroy, AfterViewInit, KbqTitleTextRef {
    private focusMonitor;
    protected styler: KbqButtonCssStyler;
    private readonly changeDetectorRef;
    hasFocus: boolean;
    textElement: ElementRef<HTMLElement>;
    /** The flex row that lays out the icons and text, used as the overflow width constraint. */
    parentTextElement: ElementRef<HTMLElement>;
    get kbqStyle(): string;
    set kbqStyle(value: string | KbqButtonStyles);
    private _kbqStyle;
    /** Whether the button is disabled. */
    get disabled(): boolean;
    set disabled(value: boolean);
    /** @docs-private */
    readonly disabledSignal: i0.WritableSignal<boolean>;
    get tabIndex(): number;
    set tabIndex(value: number);
    private _tabIndex;
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    onFocus(): void;
    onBlur(): void;
    getHostElement(): HTMLElement;
    focus(): void;
    focusViaKeyboard(): void;
    haltDisabledEvents: (event: Event) => void;
    private haltDisabledKeydownEvents;
    projectContentChanged(): void;
    private runFocusMonitor;
    private stopFocusMonitor;
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqButton, "[kbq-button]", never, { "kbqStyle": { "alias": "kbqStyle"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "tabIndex": { "alias": "tabIndex"; "required": false; }; }, {}, never, ["[kbqButtonPrefix]", "*", "[kbqButtonSuffix]"], true, never>;
    static ngAcceptInputType_disabled: unknown;
    static ngAcceptInputType_tabIndex: unknown;
}

export { KbqButton, KbqButtonStyles };
