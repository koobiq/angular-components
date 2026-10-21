import { FocusMonitor } from '@angular/cdk/a11y';
import { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { KbqColorDirective, KbqTitleTextRef } from '@koobiq/components/core';
import * as i0 from "@angular/core";
export declare enum KbqButtonStyles {
    Filled = "filled",
    Outline = "outline",
    Transparent = "transparent"
}
export declare class KbqButton extends KbqColorDirective implements OnDestroy, AfterViewInit, KbqTitleTextRef {
    private focusMonitor;
    hasFocus: boolean;
    textElement: ElementRef<HTMLElement>;
    get kbqStyle(): string;
    set kbqStyle(value: string | KbqButtonStyles);
    private _kbqStyle;
    /** Whether the button is disabled. */
    get disabled(): boolean;
    set disabled(value: boolean);
    constructor(focusMonitor: FocusMonitor);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    focus(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqButton, "[kbq-button]", never, { "kbqStyle": { "alias": "kbqStyle"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, ["[kbqButtonPrefix]", "*", "[kbqButtonSuffix]"], true, never>;
    static ngAcceptInputType_disabled: unknown;
}
