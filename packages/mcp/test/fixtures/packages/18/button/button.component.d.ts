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
    textElement: ElementRef;
    get kbqStyle(): string;
    set kbqStyle(value: string | KbqButtonStyles);
    private _kbqStyle;
    get disabled(): boolean;
    set disabled(value: boolean);
    private _disabled;
    constructor(focusMonitor: FocusMonitor);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    focus(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqButton, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqButton, "[kbq-button]", never, { "kbqStyle": { "alias": "kbqStyle"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, ["*"], false, never>;
    static ngAcceptInputType_disabled: unknown;
}
