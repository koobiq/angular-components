## API Report File for "koobiq"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AfterContentInit } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { CanColor } from '@koobiq/components/core';
import { CanColorCtor } from '@koobiq/components/core';
import { ChangeDetectorRef } from '@angular/core';
import { ElementRef } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import * as i0 from '@angular/core';
import { KbqFormFieldRef } from '@koobiq/components/core';
import { OnDestroy } from '@angular/core';

// @public (undocumented)
export class KbqIcon extends KbqIconMixinBase implements CanColor, AfterContentInit {
    constructor(elementRef: ElementRef, formField: KbqFormFieldRef, changeDetectorRef: ChangeDetectorRef);
    // (undocumented)
    autoColor: boolean;
    // (undocumented)
    protected changeDetectorRef: ChangeDetectorRef;
    // (undocumented)
    protected formField: KbqFormFieldRef;
    // (undocumented)
    getHostElement(): any;
    // (undocumented)
    hasError: boolean;
    iconName: string;
    // (undocumented)
    protected name: string;
    // (undocumented)
    ngAfterContentInit(): void;
    // (undocumented)
    small: boolean;
    // (undocumented)
    updateMaxHeight(): void;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqIcon, "[kbq-icon]", never, { "color": { "alias": "color"; "required": false; }; "small": { "alias": "small"; "required": false; }; "autoColor": { "alias": "autoColor"; "required": false; }; "iconName": { "alias": "kbq-icon"; "required": false; }; }, {}, never, ["*"], true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqIcon, [null, { optional: true; }, null]>;
}

// @public
export class KbqIconBase {
    constructor(elementRef: ElementRef);
    // (undocumented)
    elementRef: ElementRef;
}

// @public (undocumented)
export class KbqIconButton extends KbqIcon implements AfterViewInit, OnDestroy, CanColor {
    constructor(elementRef: ElementRef, formField: KbqFormFieldRef, changeDetectorRef: ChangeDetectorRef, focusMonitor: FocusMonitor);
    // (undocumented)
    protected changeDetectorRef: ChangeDetectorRef;
    get disabled(): boolean;
    set disabled(value: boolean);
    iconName: string;
    // (undocumented)
    name: string;
    // (undocumented)
    static ngAcceptInputType_disabled: unknown;
    // (undocumented)
    ngAfterViewInit(): void;
    // (undocumented)
    ngOnDestroy(): void;
    // (undocumented)
    small: boolean;
    // (undocumented)
    get tabindex(): any;
    set tabindex(value: any);
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqIconButton, "[kbq-icon-button]", never, { "color": { "alias": "color"; "required": false; }; "small": { "alias": "small"; "required": false; }; "iconName": { "alias": "kbq-icon-button"; "required": false; }; "tabindex": { "alias": "tabindex"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; }, {}, never, ["*"], true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqIconButton, [null, { optional: true; }, null, null]>;
}

// @public (undocumented)
export class KbqIconItem extends KbqIcon implements CanColor {
    constructor(elementRef: ElementRef, formField: KbqFormFieldRef, changeDetectorRef: ChangeDetectorRef);
    // (undocumented)
    big: boolean;
    // (undocumented)
    protected changeDetectorRef: ChangeDetectorRef;
    // (undocumented)
    fade: boolean;
    iconName: string;
    // (undocumented)
    name: string;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqIconItem, "[kbq-icon-item]", never, { "color": { "alias": "color"; "required": false; }; "iconName": { "alias": "kbq-icon-item"; "required": false; }; "fade": { "alias": "fade"; "required": false; }; "big": { "alias": "big"; "required": false; }; }, {}, never, ["*"], true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqIconItem, [null, { optional: true; }, null]>;
}

// @public
export const KbqIconMixinBase: CanColorCtor & typeof KbqIconBase;

// @public (undocumented)
export class KbqIconModule {
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqIconModule, never>;
    // (undocumented)
    static ɵinj: i0.ɵɵInjectorDeclaration<KbqIconModule>;
    // Warning: (ae-forgotten-export) The symbol "i1" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i2" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i3" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    static ɵmod: i0.ɵɵNgModuleDeclaration<KbqIconModule, never, [typeof i1.KbqIcon, typeof i2.KbqIconButton, typeof i3.KbqIconItem], [typeof i1.KbqIcon, typeof i2.KbqIconButton, typeof i3.KbqIconItem]>;
}

// (No @packageDocumentation comment for this package)

```
