import * as i0 from '@angular/core';
import { AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { KbqOverflowShadowSource } from '@koobiq/components/core';

declare class KbqScrollbar implements AfterViewInit, OnDestroy, KbqOverflowShadowSource {
    private readonly elementRef;
    constructor();
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqScrollbar, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqScrollbar, "kbq-scrollbar, [kbq-scrollbar]", ["kbqScrollbar"], { "initializationTarget": { "alias": "initializationTarget"; "required": false; "isSignal": true; }; "options": { "alias": "options"; "required": false; "isSignal": true; }; "events": { "alias": "events"; "required": false; "isSignal": true; }; "defer": { "alias": "defer"; "required": false; "isSignal": true; }; }, { "onInitialize": "onInitialize"; "onUpdate": "onUpdate"; "onDestroy": "onDestroy"; "onScroll": "onScroll"; }, never, ["*"], true, never>;
}

export { KbqScrollbar };
